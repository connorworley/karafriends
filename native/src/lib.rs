#![allow(non_snake_case)]

mod pitch_detector;

use std::cell::RefCell;
use std::cmp::Ordering;
use std::collections::HashMap;
use std::iter::Iterator;
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::*;
use rubato::Resampler;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[cfg(feature = "asio")]
type InputSample = i16;
#[cfg(not(feature = "asio"))]
type InputSample = f32;

#[cfg(feature = "asio")]
extern "C" {
    #[cfg(target_env = "gnu")]
    #[link_name = "\u{1}__Z16ASIOControlPanelv"]
    #[cfg(target_env = "msvc")]
    #[link_name = "?ASIOControlPanel@@YAJXZ"]
    fn ASIOControlPanel() -> asio_sys::bindings::asio_import::ASIOError;
}

enum DeviceType {
    #[cfg(feature = "asio")]
    Asio,
    Usb,
}

const ECHO_DELAY_SECS: f32 = 0.06;
const ECHO_AMPLITUDE: f32 = 0.25;

struct InputDevice {
    input_stream: Arc<Mutex<cpal::Stream>>,
    output_stream: Arc<Mutex<cpal::Stream>>,
    pitch_rx: ringbuf::Consumer<f32>,
    pitch_sample_count: usize,
    pitch_detector: pitch_detector::PitchDetector,
}

unsafe impl Send for InputDevice {}

impl Finalize for InputDevice {}

impl InputDevice {
    fn get_pitch(&mut self) -> Result<(f32, f32)> {
        let mut samples = vec![0.0; self.pitch_sample_count];
        self.pitch_rx.pop_slice(&mut samples);
        Ok(self.pitch_detector.detect(samples))
    }

    fn stop(&self) -> Result<()> {
        self.input_stream.lock().unwrap().pause()?;
        self.output_stream.lock().unwrap().pause()?;
        Ok(())
    }
}

fn cpal_safe<T: Send + 'static>(f: impl FnOnce() -> T + Send + 'static) -> T {
    // Cpal tries to set the threading model on Windows, which breaks when Node
    // has already set a different threading model. To work around this, we need
    // to make cpal calls in a different thread on Windows.
    #[cfg(windows)]
    {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            tx.send(f()).unwrap();
        });
        rx.recv().unwrap()
    }
    #[cfg(not(windows))]
    f()
}

#[cfg(feature = "asio")]
lazy_static::lazy_static! {
    static ref CPAL_ASIO_HOST: std::result::Result<cpal::Host, cpal::HostUnavailable> = cpal::host_from_id(cpal::HostId::Asio);
}

lazy_static::lazy_static! {
    static ref INPUT_DEVICES: Mutex<HashMap<String, cpal::Device>> = Mutex::new(HashMap::new());
}

fn alloc_console(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    #[cfg(windows)]
    if let Err(e) = win32console::console::WinConsole::alloc_console() {
        return cx.throw_error(e.to_string());
    } else if let Err(e) =
        win32console::console::WinConsole::set_title("karafriends native console")
    {
        return cx.throw_error(e.to_string());
    }
    Ok(cx.undefined())
}

fn input_devices(mut cx: FunctionContext) -> JsResult<JsArray> {
    let input_devices: Vec<_> = match cpal_safe(|| -> Result<Vec<_>> {
        Ok(_input_devices()?
            .map(|(input_device, device_type)| {
                let mut supported_input_configs: Vec<_> =
                    input_device.supported_input_configs().unwrap().collect();
                supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
                let best_supported_input_config = supported_input_configs
                    .last()
                    .ok_or("No supported input configs")
                    .unwrap();
                let input_config = supported_config_to_config(best_supported_input_config);
                (
                    _device_name(&input_device, &device_type),
                    input_config.channels,
                )
            })
            .collect())
    }) {
        Ok(devices) => devices,
        Err(e) => return cx.throw_error(e.to_string()),
    };
    let js_array = JsArray::new(&mut cx, input_devices.len() as u32);
    for (i, (name, channel_count)) in input_devices.iter().enumerate() {
        let js_name = cx.string(name);
        let js_channel_count = cx.number(*channel_count);
        let inner_array = JsArray::new(&mut cx, 2);
        inner_array.set(&mut cx, 0, js_name)?;
        inner_array.set(&mut cx, 1, js_channel_count)?;
        js_array.set(&mut cx, i as u32, inner_array)?;
    }
    Ok(js_array)
}

fn compare_configs(
    a: &cpal::SupportedStreamConfigRange,
    b: &cpal::SupportedStreamConfigRange,
    desired_sample_rate: Option<cpal::SampleRate>,
) -> Ordering {
    // Our priorities in order are buffer size (lower is better), sample rate
    // (higher is better), and channel count (higher is better).
    // If we have a desired sample rate, just being in range is good enough.
    if a.buffer_size() == &cpal::SupportedBufferSize::Unknown
        && b.buffer_size() != &cpal::SupportedBufferSize::Unknown
    {
        return Ordering::Less;
    }
    if a.buffer_size() != &cpal::SupportedBufferSize::Unknown
        && b.buffer_size() == &cpal::SupportedBufferSize::Unknown
    {
        return Ordering::Greater;
    }
    if let cpal::SupportedBufferSize::Range { min, max: _ } = a.buffer_size() {
        let a_min = min;
        if let cpal::SupportedBufferSize::Range { min, max: _ } = b.buffer_size() {
            let b_min = min;
            let buffer_size_cmp = a_min.cmp(b_min);
            if buffer_size_cmp != Ordering::Equal {
                return buffer_size_cmp.reverse();
            }
        }
    }
    if let Some(sample_rate) = desired_sample_rate {
        let a_in_range = sample_rate >= a.min_sample_rate() && sample_rate <= a.max_sample_rate();
        let b_in_range = sample_rate >= b.min_sample_rate() && sample_rate <= b.max_sample_rate();
        if !a_in_range && b_in_range {
            return Ordering::Less;
        }
        if a_in_range && !b_in_range {
            return Ordering::Greater;
        }
    }

    let sample_rate_cmp = a.max_sample_rate().cmp(&b.max_sample_rate());
    if sample_rate_cmp != Ordering::Equal {
        return sample_rate_cmp;
    }

    let channels_cmp = a.channels().cmp(&b.channels());
    if channels_cmp != Ordering::Equal {
        return channels_cmp;
    }

    a.cmp_default_heuristics(b)
}

fn supported_config_to_config(
    config_range: &cpal::SupportedStreamConfigRange,
) -> cpal::StreamConfig {
    cpal::StreamConfig {
        channels: config_range.channels(),
        sample_rate: config_range.max_sample_rate(),
        buffer_size: match config_range.buffer_size() {
            cpal::SupportedBufferSize::Range { min, max: _ } => cpal::BufferSize::Fixed(*min),
            cpal::SupportedBufferSize::Unknown => cpal::BufferSize::Default,
        },
    }
}

fn _input_devices() -> Result<impl Iterator<Item = (cpal::Device, DeviceType)>> {
    let default_devices = cpal::default_host()
        .input_devices()?
        .map(|device| (device, DeviceType::Usb));
    #[cfg(feature = "asio")]
    {
        Ok(default_devices.chain(
            CPAL_ASIO_HOST
                .as_ref()
                .map_err(|_| "ASIO cpal host unavailable!")?
                .input_devices()?
                .map(|device| (device, DeviceType::Asio)),
        ))
    }
    #[cfg(not(feature = "asio"))]
    Ok(default_devices)
}

fn _device_name(device: &cpal::Device, device_type: &DeviceType) -> String {
    format!(
        "{} ({})",
        device.name().unwrap(),
        match device_type {
            #[cfg(feature = "asio")]
            DeviceType::Asio => "ASIO",
            DeviceType::Usb => "USB",
        }
    )
}

fn input_device__new(mut cx: FunctionContext) -> JsResult<JsBox<RefCell<InputDevice>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let channel_selection = cx.argument::<JsNumber>(1)?.value(&mut cx) as usize;
    let device = match cpal_safe(move || -> Result<InputDevice> {
        let mut input_devices = INPUT_DEVICES.lock().unwrap();
        let input_device = match input_devices.get(&name) {
            Some(device) => device,
            None => {
                input_devices.insert(
                    name.clone(),
                    _input_devices()?
                        .find(|(input_device, device_type)| {
                            _device_name(input_device, device_type) == name
                        })
                        .ok_or(format!("Could not find device: {}", name))?
                        .0,
                );
                &input_devices[&name]
            }
        };
        let mut supported_input_configs: Vec<_> = input_device.supported_input_configs()?.collect();
        supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
        let best_supported_input_config = supported_input_configs
            .last()
            .ok_or("No supported input configs")?;
        let input_config = supported_config_to_config(best_supported_input_config);
        let input_channels = input_config.channels as usize;
        let input_sample_rate = input_config.sample_rate.0;

        println!(
            "Created input device {} with config {:#?}",
            input_device.name().unwrap(),
            input_config
        );

        let output_host = cpal::default_host();
        let output_device = output_host
            .default_output_device()
            .ok_or("No default output device")?;
        let mut supported_output_configs: Vec<_> =
            output_device.supported_output_configs()?.collect();
        supported_output_configs
            .sort_by(|a, b| compare_configs(a, b, Some(input_config.sample_rate)));
        let best_supported_output_config = supported_output_configs
            .last()
            .ok_or("No supported output configs")?;
        let mut output_config = supported_config_to_config(best_supported_output_config);
        if input_config.sample_rate >= best_supported_output_config.min_sample_rate()
            && input_config.sample_rate <= best_supported_output_config.max_sample_rate()
        {
            output_config.sample_rate = input_config.sample_rate;
        }
        let output_channels = output_config.channels as usize;
        let output_sample_rate = output_config.sample_rate.0;

        println!(
            "Created output device {} with config {:#?}",
            output_device.name().unwrap(),
            output_config
        );

        let pitch_sample_count = (input_sample_rate / 40) as usize;
        let (mut pitch_tx, pitch_rx) = ringbuf::RingBuffer::new(pitch_sample_count).split();

        let latency_sample_count = (input_sample_rate as f32 * ECHO_DELAY_SECS) as usize;
        let (mut echo_tx, mut echo_rx) =
            ringbuf::RingBuffer::new(latency_sample_count * 2 * output_channels).split();
        for _ in 0..latency_sample_count * output_channels {
            echo_tx
                .push(0.0)
                .map_err(|_| "Failed to push to echo buffer")?;
        }

        let (mut output_tx, mut output_rx) =
            ringbuf::RingBuffer::new(2048 * output_channels).split();

        let pitch_detector =
            pitch_detector::PitchDetector::new(input_sample_rate as f32, pitch_sample_count);

        let mut resampler = rubato::SincFixedIn::<f32>::new(
            output_sample_rate as f64 / input_sample_rate as f64 as f64,
            1.0,
            rubato::InterpolationParameters {
                sinc_len: 256,
                f_cutoff: 0.95,
                interpolation: rubato::InterpolationType::Linear,
                oversampling_factor: 256,
                window: rubato::WindowFunction::BlackmanHarris2,
            },
            match input_config.buffer_size {
                cpal::BufferSize::Fixed(count) => count as usize,
                cpal::BufferSize::Default => (input_sample_rate / output_sample_rate) as usize,
            },
            // 1,
            1,
        )?;
        let mut resampler_output = resampler.output_buffer_allocate();

        let input_stream = input_device.build_input_stream(
            &input_config,
            move |samples: &[InputSample], _| {
                let mono_samples: Vec<_> = samples
                    .chunks(input_channels)
                    .map(|channel_samples| {
                        #[cfg(feature = "asio")]
                        {
                            channel_samples[channel_selection] as f32 / InputSample::MAX as f32
                        }
                        #[cfg(not(feature = "asio"))]
                        channel_samples[channel_selection]
                    })
                    .collect();

                pitch_tx.push_slice(&mono_samples);

                let mut echo_samples = vec![0.0; mono_samples.len()];
                echo_rx.pop_slice(echo_samples.as_mut_slice());

                let output_samples: Vec<_> = mono_samples
                    .iter()
                    .zip(echo_samples.iter().map(|sample| sample * ECHO_AMPLITUDE))
                    .map(|(incoming, echo)| incoming + echo)
                    .collect();

                echo_tx.push_slice(output_samples.as_slice());

                if input_sample_rate != output_sample_rate {
                    resampler
                        .process_into_buffer(&[&output_samples], &mut resampler_output, None)
                        .unwrap();
                    for sample in &resampler_output[0] {
                        for _ in 0..output_channels {
                            if output_tx.push(*sample).is_err() {
                                eprintln!("output fell behind (with sample rate conversion)!");
                            }
                        }
                    }
                } else {
                    for sample in output_samples {
                        for _ in 0..output_channels {
                            if output_tx.push(sample).is_err() {
                                eprintln!("output fell behind!");
                            }
                        }
                    }
                }
            },
            |e| panic!("{}", e),
        )?;

        let output_stream = output_device.build_output_stream(
            &output_config,
            move |samples: &mut [f32], _| {
                let samples_read = output_rx.pop_slice(samples);
                if samples_read < samples.len() {
                    eprintln!("input fell behind");
                }
            },
            |e| panic!("{}", e),
        )?;

        input_stream.play()?;
        output_stream.play()?;

        Ok(InputDevice {
            input_stream: Arc::new(Mutex::new(input_stream)),
            output_stream: Arc::new(Mutex::new(output_stream)),
            pitch_rx,
            pitch_sample_count,
            pitch_detector,
        })
    }) {
        Ok(device) => device,
        Err(e) => return cx.throw_error(e.to_string()),
    };
    Ok(cx.boxed(RefCell::new(device)))
}

fn input_device__get_pitch(mut cx: FunctionContext) -> JsResult<JsObject> {
    let device = cx.argument::<JsBox<RefCell<InputDevice>>>(0)?;
    let mut device = device.borrow_mut();
    let (midi_number, confidence) = match device.get_pitch() {
        Ok((midi_number, confidence)) => (midi_number, confidence),
        Err(e) => return cx.throw_error(e.to_string()),
    };
    let js_object = JsObject::new(&mut cx);
    let midi_number = cx.number(midi_number);
    let confidence = cx.number(confidence);
    js_object.set(&mut cx, "midiNumber", midi_number)?;
    js_object.set(&mut cx, "confidence", confidence)?;
    Ok(js_object)
}

fn input_device__stop(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let device = cx.argument::<JsBox<RefCell<InputDevice>>>(0)?;
    if let Err(e) = device.borrow().stop() {
        return cx.throw_error(e.to_string());
    }
    Ok(cx.undefined())
}

register_module!(mut m, {
    std::panic::set_hook(Box::new(|panic_info| {
        std::eprintln!("{:#?}", panic_info);
    }));

    m.export_function("allocConsole", alloc_console)?;
    m.export_function("inputDevices", input_devices)?;
    m.export_function("inputDevice_new", input_device__new)?;
    m.export_function("inputDevice_getPitch", input_device__get_pitch)?;
    m.export_function("inputDevice_stop", input_device__stop)?;

    Ok(())
});
