#![allow(non_snake_case)]

use std::cell::RefCell;
use std::cmp::Ordering;
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::*;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

const ECHO_DELAY_SECS: f32 = 0.06;
const ECHO_AMPLITUDE: f32 = 0.25;

enum ChannelSelection {
    Channel(u8),
    All,
}

struct InputDevice {
    input_stream: Arc<Mutex<cpal::platform::Stream>>,
    output_stream: Arc<Mutex<cpal::platform::Stream>>,
    pitch_rx: ringbuf::Consumer<f32>,
    pitch_sample_count: usize,
    pitch_detector: Arc<Mutex<aubio_rs::Pitch>>,
}

unsafe impl Send for InputDevice {}

impl Finalize for InputDevice {}

impl InputDevice {
    fn get_pitch(&mut self) -> Result<(f32, f32)> {
        let mut samples = vec![0.0; self.pitch_sample_count];
        self.pitch_rx.pop_slice(&mut samples);
        let mut pd = self.pitch_detector.lock().unwrap();
        let midi_number = pd.do_result(&samples)?;
        Ok((midi_number, pd.get_confidence()))
    }

    fn stop(&self) -> Result<()> {
        self.input_stream.lock().unwrap().pause()?;
        self.output_stream.lock().unwrap().pause()?;
        Ok(())
    }
}

struct Resampler {
    resampler: aubio_rs::Resampler,
}

unsafe impl Send for Resampler {}

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

fn input_devices(mut cx: FunctionContext) -> JsResult<JsArray> {
    let input_devices: Vec<_> = match cpal_safe(|| -> Result<Vec<_>> {
        let host = cpal::default_host();
        Ok(host
            .input_devices()?
            .map(|input_device| {
                let mut supported_input_configs: Vec<_> =
                    input_device.supported_input_configs().unwrap().collect();
                supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
                let best_supported_input_config = supported_input_configs
                    .last()
                    .ok_or("No supported input configs")
                    .unwrap();
                let input_config = supported_config_to_config(best_supported_input_config);
                (input_device.name().unwrap(), 1)
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
    // (higher is better), and channel count (lower is better).
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
        return channels_cmp.reverse();
    }

    a.cmp_default_heuristics(b)
}

fn supported_config_to_config(
    config_range: &cpal::SupportedStreamConfigRange,
) -> cpal::StreamConfig {
    cpal::StreamConfig {
        channels: 1,
        sample_rate: config_range.max_sample_rate(),
        buffer_size: match config_range.buffer_size() {
            cpal::SupportedBufferSize::Range { min, max: _ } => cpal::BufferSize::Fixed(*min),
            cpal::SupportedBufferSize::Unknown => cpal::BufferSize::Default,
        },
    }
}

fn input_device__new(mut cx: FunctionContext) -> JsResult<JsBox<RefCell<InputDevice>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let channel_selection = match cx.argument::<JsNumber>(1)?.value(&mut cx) as i16 {
        -1 => ChannelSelection::All,
        i => ChannelSelection::Channel(i as u8),
    };
    let device = match cpal_safe(move || -> Result<InputDevice> {
        let host = cpal::default_host();
        let input_device = host
            .input_devices()?
            .find(|device| device.name().unwrap() == name)
            .ok_or(format!("Could not find device: {}", name))?;
        let mut supported_input_configs: Vec<_> = input_device.supported_input_configs()?.collect();
        supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
        let best_supported_input_config = supported_input_configs
            .last()
            .ok_or("No supported input configs")?;
        let input_config = supported_config_to_config(best_supported_input_config);
        let input_channels = input_config.channels as usize;

        let output_device = host
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

        let sample_rate = input_config.sample_rate.0;

        let pitch_sample_count = (sample_rate / 40) as usize;
        let (mut pitch_tx, pitch_rx) = ringbuf::RingBuffer::new(pitch_sample_count).split();

        let latency_sample_count = (sample_rate as f32 * ECHO_DELAY_SECS) as usize;
        let (mut echo_tx, mut echo_rx) =
            ringbuf::RingBuffer::new(latency_sample_count * 2 * output_channels).split();
        for _ in 0..latency_sample_count * output_channels {
            echo_tx
                .push(0.0)
                .map_err(|_| "Failed to push to echo buffer")?;
        }

        let (mut output_tx, mut output_rx) =
            ringbuf::RingBuffer::new(2048 * output_channels).split();

        let sample_ratio = output_config.sample_rate.0 as f32 / sample_rate as f32;
        let mut resampler = Resampler {
            resampler: aubio_rs::Resampler::new(
                sample_ratio,
                aubio_rs::ResampleMode::MediumQuality,
            )?,
        };

        let pitch_detector = aubio_rs::Pitch::new(
            aubio_rs::PitchMode::Yinfast,
            pitch_sample_count,
            pitch_sample_count,
            sample_rate,
        )?
        .with_unit(aubio_rs::PitchUnit::Midi);

        let input_stream = input_device.build_input_stream(
            &input_config,
            move |samples: &[f32], _| {
                let mono_samples: Vec<_> = samples
                    .chunks(input_channels)
                    .map(|channel_samples| match channel_selection {
                        ChannelSelection::All => {
                            channel_samples.iter().sum::<f32>() / input_channels as f32
                        }
                        ChannelSelection::Channel(i) => channel_samples[i as usize],
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

                let resampled_output_samples = if (sample_ratio - 1.0).abs() > f32::EPSILON {
                    let mut resample_buffer =
                        vec![0.0; (output_samples.len() as f32 * sample_ratio) as usize];
                    resampler
                        .resampler
                        .do_(output_samples, &mut resample_buffer)
                        .unwrap();
                    resample_buffer
                } else {
                    output_samples
                };
                for sample in resampled_output_samples {
                    for _ in 0..output_channels {
                        if output_tx.push(sample).is_err() {
                            eprintln!("output fell behind!");
                        }
                    }
                }
            },
            |e| std::panic!("{}", e),
        )?;

        let output_stream = output_device.build_output_stream(
            &output_config,
            move |samples: &mut [f32], _| {
                let samples_read = output_rx.pop_slice(samples);
                if samples_read < samples.len() {
                    eprintln!("input fell behind");
                }
            },
            |e| std::panic!("{}", e),
        )?;

        input_stream.play()?;
        output_stream.play()?;

        Ok(InputDevice {
            input_stream: Arc::new(Mutex::new(input_stream)),
            output_stream: Arc::new(Mutex::new(output_stream)),
            pitch_rx,
            pitch_sample_count,
            pitch_detector: Arc::new(Mutex::new(pitch_detector)),
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
    m.export_function("inputDevices", input_devices)?;
    m.export_function("inputDevice_new", input_device__new)?;
    m.export_function("inputDevice_getPitch", input_device__get_pitch)?;
    m.export_function("inputDevice_stop", input_device__stop)?;
    Ok(())
});
