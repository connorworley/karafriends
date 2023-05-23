#![allow(non_snake_case)]

mod pitch_detector;

use std::cmp::Ordering;
use std::collections::HashMap;
use std::iter::{FromIterator, Iterator};
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::Finalize;
use rubato::Resampler;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[cfg(feature = "asio")]
lazy_static::lazy_static! {
    static ref CPAL_ASIO_HOST: std::result::Result<cpal::Host, cpal::HostUnavailable> = cpal::host_from_id(cpal::HostId::Asio);
}

lazy_static::lazy_static! {
    static ref INPUT_DEVICES: Mutex<HashMap<String, cpal::Device>> = Mutex::new(HashMap::new());
}
enum DeviceType {
    #[cfg(feature = "asio")]
    Asio,
    Usb,
}

const ECHO_DELAY_SECS: f32 = 0.06;
const ECHO_AMPLITUDE: f32 = 0.25;

pub struct InputDevice {
    input_stream: Arc<Mutex<cpal::Stream>>,
    output_stream: Arc<Mutex<cpal::Stream>>,
    pitch_rx: ringbuf::HeapConsumer<f32>,
    pitch_sample_count: usize,
    pitch_detector: pitch_detector::PitchDetector,
}

unsafe impl Send for InputDevice {}

impl Finalize for InputDevice {}

impl InputDevice {
    pub fn collect_devices<Collector: FromIterator<(String, cpal::StreamConfig)>>(
    ) -> Result<Collector> {
        _input_devices()?
            .map(|(input_device, device_type)| {
                let mut supported_input_configs: Vec<_> =
                    input_device.supported_input_configs().unwrap().collect();
                supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
                let best_supported_input_config = supported_input_configs
                    .last()
                    .ok_or("No supported input configs")?;
                let input_config = supported_config_to_config(best_supported_input_config);
                Ok((_device_name(&input_device, &device_type), input_config))
            })
            .collect::<Result<Collector>>()
    }

    pub fn new(name: &str, channel_selection: usize) -> Result<Self> {
        let mut input_devices = INPUT_DEVICES.lock().unwrap();
        let input_device = match input_devices.get(name) {
            Some(device) => device,
            None => {
                input_devices.insert(
                    name.to_string(),
                    _input_devices()?
                        .find(|(input_device, device_type)| {
                            _device_name(input_device, device_type) == name
                        })
                        .ok_or(format!("Could not find device: {}", name))?
                        .0,
                );
                &input_devices[name]
            }
        };
        let mut supported_input_configs: Vec<_> = input_device.supported_input_configs()?.collect();
        supported_input_configs.sort_by(|a, b| compare_configs(a, b, None));
        let best_supported_input_config = supported_input_configs
            .last()
            .ok_or("No supported input configs")?;
        let input_config = supported_config_to_config(best_supported_input_config);
        let _input_channels = input_config.channels as usize;
        let input_sample_rate = input_config.sample_rate.0;

        println!(
            "Created input device {} with config {:#?}, sample format {:#?}",
            input_device.name()?,
            input_config,
            best_supported_input_config.sample_format(),
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
        let _output_sample_rate = output_config.sample_rate.0;

        println!(
            "Created output device {} with config {:#?}, sample format {:#?}",
            output_device.name().unwrap(),
            output_config,
            best_supported_output_config.sample_format(),
        );

        let pitch_sample_count = (input_sample_rate / 40) as usize;
        let (pitch_tx, pitch_rx) = ringbuf::HeapRb::new(pitch_sample_count).split();

        let (output_tx, output_rx) = ringbuf::HeapRb::new(2048 * output_channels).split();

        let pitch_detector =
            pitch_detector::PitchDetector::new(input_sample_rate as f32, pitch_sample_count);

        let error_callback = |e| panic!("{}", e);

        let input_stream = match best_supported_input_config.sample_format() {
            cpal::SampleFormat::U8 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<i8>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U16 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<u16>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U32 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<u32>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U64 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<u64>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I8 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<i8>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I16 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<i16>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I32 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<i32>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I64 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<i64>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::F32 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<f32>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::F64 => input_device.build_input_stream(
                &input_config,
                Self::input_data_callback::<f64>(
                    &input_config,
                    &output_config,
                    channel_selection,
                    pitch_tx,
                    output_tx,
                )?,
                error_callback,
                None,
            ),
            _ => Err(cpal::BuildStreamError::StreamConfigNotSupported),
        }?;

        let output_stream = match best_supported_output_config.sample_format() {
            cpal::SampleFormat::U8 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<u8>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U16 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<u16>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U32 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<u32>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::U64 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<u64>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I8 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<i8>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I16 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<i16>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I32 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<i32>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::I64 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<i64>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::F32 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<f32>(output_rx)?,
                error_callback,
                None,
            ),
            cpal::SampleFormat::F64 => output_device.build_output_stream(
                &output_config,
                Self::output_data_callback::<f64>(output_rx)?,
                error_callback,
                None,
            ),
            _ => Err(cpal::BuildStreamError::StreamConfigNotSupported),
        }?;

        input_stream.play()?;
        output_stream.play()?;

        Ok(InputDevice {
            input_stream: Arc::new(Mutex::new(input_stream)),
            output_stream: Arc::new(Mutex::new(output_stream)),
            pitch_rx,
            pitch_sample_count,
            pitch_detector,
        })
    }

    pub fn get_pitch(&mut self) -> Result<(f32, f32)> {
        let mut samples = vec![0.0; self.pitch_sample_count];
        self.pitch_rx.pop_slice(&mut samples);
        Ok(self.pitch_detector.detect(samples))
    }

    pub fn stop(&self) -> Result<()> {
        self.input_stream.lock().unwrap().pause()?;
        self.output_stream.lock().unwrap().pause()?;
        Ok(())
    }

    fn input_data_callback<Sample: cpal::Sample + Copy>(
        input_config: &cpal::StreamConfig,
        output_config: &cpal::StreamConfig,
        channel_selection: usize,
        mut pitch_tx: ringbuf::HeapProducer<f32>,
        mut output_tx: ringbuf::HeapProducer<f32>,
    ) -> Result<impl FnMut(&[Sample], &cpal::InputCallbackInfo) + Send + 'static>
    where
        f32: cpal::FromSample<Sample>,
    {
        let input_channels = input_config.channels as usize;
        let output_channels = output_config.channels as usize;
        let input_sample_rate = input_config.sample_rate.0;
        let output_sample_rate = output_config.sample_rate.0;

        let latency_sample_count = (input_sample_rate as f32 * ECHO_DELAY_SECS) as usize;
        let (mut echo_tx, mut echo_rx) =
            ringbuf::HeapRb::new(latency_sample_count * 2 * output_channels).split();

        for _ in 0..latency_sample_count * output_channels {
            echo_tx
                .push(0.0_f32)
                .map_err(|_| "Failed to push to echo buffer")?;
        }

        let mut resampler = rubato::SincFixedIn::<f32>::new(
            output_sample_rate as f64 / input_sample_rate as f64,
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
            1,
        )?;
        let mut resampler_output = resampler.output_buffer_allocate();

        Ok(move |samples: &[Sample], _: &_| {
            let mono_samples: Vec<_> = samples
                .chunks(input_channels)
                .map(|channel_samples| {
                    <f32 as cpal::Sample>::from_sample(channel_samples[channel_selection])
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
                if let Err(e) =
                    resampler.process_into_buffer(&[&output_samples], &mut resampler_output, None)
                {
                    eprintln!("{}", e);
                };
                let samples_written = output_tx.push_iter(
                    &mut resampler_output[0]
                        .iter_mut()
                        .flat_map(|sample| std::iter::repeat(*sample).take(output_channels)),
                );
                if samples_written < resampler_output[0].len() {
                    eprintln!("output fell behind (with sample rate conversion)!");
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
        })
    }

    fn output_data_callback<Sample: cpal::Sample + cpal::FromSample<f32> + Send>(
        mut output_rx: ringbuf::HeapConsumer<f32>,
    ) -> Result<impl FnMut(&mut [Sample], &cpal::OutputCallbackInfo) + Send + 'static> {
        Ok(move |samples: &mut [Sample], _: &_| {
            if output_rx.len() < samples.len() {
                eprintln!("input fell behind");
            }
            samples
                .iter_mut()
                .zip(output_rx.pop_iter())
                .for_each(|(sample, float_sample)| *sample = Sample::from_sample(float_sample));
        })
    }
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
            // WASAPI seems to lie about buffer size (how is 0 even possible?)
            // In reality, we seem to get sample_rate / 100
            cpal::SupportedBufferSize::Range { min: 0, max: _ } => {
                cpal::BufferSize::Fixed(config_range.max_sample_rate().0 / 100)
            }
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
