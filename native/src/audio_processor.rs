use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

const ECHO_DELAY_SECS: f32 = 0.06;
const ECHO_AMPLITUDE: f32 = 0.25;

#[cfg(feature = "asio")]
extern "C" {
    #[link_name = "\u{1}__Z16ASIOControlPanelv"]
    fn ASIOControlPanel() -> asio_sys::bindings::asio_import::ASIOError;
    fn start(
        driver_name: *const std::os::raw::c_char,
        callback: extern "C" fn(
            *const std::os::raw::c_int,
            *const std::os::raw::c_int,
            std::os::raw::c_int,
            *const std::os::raw::c_void,
        ),
        data: *const std::os::raw::c_void,
    );
}

#[cfg(feature = "asio")]
struct AsioCallbackData {
    output_channels: usize,
    output_tx_1: ringbuf::Producer<f32>,
    output_tx_2: ringbuf::Producer<f32>,
    pitch_tx_1: ringbuf::Producer<f32>,
    pitch_tx_2: ringbuf::Producer<f32>,
}

struct CallbackDataPtr(*const std::os::raw::c_void);

unsafe impl Send for CallbackDataPtr {}
enum InputStream {
    Default(cpal::platform::Stream),
    #[cfg(feature = "asio")]
    Asio(*const AsioCallbackData),
}

pub struct AudioProcessor {
    input_stream: Arc<Mutex<InputStream>>,
    output_stream_1: Arc<Mutex<cpal::platform::Stream>>,
    output_stream_2: Arc<Mutex<cpal::platform::Stream>>,
    pitch_rx_1: ringbuf::Consumer<f32>,
    pitch_rx_2: ringbuf::Consumer<f32>,
    pitch_sample_count: usize,
    pitch_detector_1: Arc<Mutex<aubio_rs::Pitch>>,
    pitch_detector_2: Arc<Mutex<aubio_rs::Pitch>>,
}

unsafe impl Send for AudioProcessor {}

impl AudioProcessor {
    pub fn get_pitch(&mut self, left: bool) -> crate::Result<(f32, f32)> {
        if left {
            let mut samples = vec![0.0; self.pitch_sample_count];
            self.pitch_rx_1.pop_slice(&mut samples);
            let mut pd = self.pitch_detector_1.lock().unwrap();
            let midi_number = pd.do_result(&samples)?;
            Ok((midi_number, pd.get_confidence()))
        } else {
            let mut samples = vec![0.0; self.pitch_sample_count];
            self.pitch_rx_2.pop_slice(&mut samples);
            let mut pd = self.pitch_detector_2.lock().unwrap();
            let midi_number = pd.do_result(&samples)?;
            Ok((midi_number, pd.get_confidence()))
        }
    }

    pub fn stop(&self) -> crate::Result<()> {
        match &*self.input_stream.lock().unwrap() {
            InputStream::Default(stream) => stream.pause()?,
            #[cfg(feature = "asio")]
            InputStream::Asio(_) => {}
        }
        self.output_stream_1.lock().unwrap().pause()?;
        self.output_stream_2.lock().unwrap().pause()?;
        Ok(())
    }

    pub fn new(name: String, is_asio: bool) -> crate::Result<Self> {
        let default_host = cpal::default_host();

        let output_device = default_host
            .default_output_device()
            .ok_or("no default output device")?;
        let output_config = output_device.default_output_config()?.config();
        let output_channels = output_config.channels as usize;
        let (mut output_tx_1, mut output_rx_1) =
            ringbuf::RingBuffer::new(2048 * output_channels).split();
        let (mut output_tx_2, mut output_rx_2) =
            ringbuf::RingBuffer::new(2048 * output_channels).split();

        let sample_rate = 48000;
        let pitch_sample_count = (sample_rate / 40) as usize;
        let (mut pitch_tx_1, pitch_rx_1) = ringbuf::RingBuffer::new(pitch_sample_count).split();
        let (mut pitch_tx_2, pitch_rx_2) = ringbuf::RingBuffer::new(pitch_sample_count).split();

        let latency_sample_count = (sample_rate as f32 * ECHO_DELAY_SECS) as usize;
        let (mut echo_tx_1, mut echo_rx_1) =
            ringbuf::RingBuffer::new(latency_sample_count * 2 * output_channels).split();
        for _ in 0..latency_sample_count * output_channels {
            echo_tx_1
                .push(0.0)
                .map_err(|_| "Failed to push to echo buffer")?;
        }
        let (mut echo_tx_2, mut echo_rx_2) =
            ringbuf::RingBuffer::new(latency_sample_count * 2 * output_channels).split();
        for _ in 0..latency_sample_count * output_channels {
            echo_tx_2
                .push(0.0)
                .map_err(|_| "Failed to push to echo buffer")?;
        }

        let input_stream = {
            if cfg!(feature = "asio") && is_asio {
                extern "C" fn sample_handler(
                    buffer_ptr_1: *const std::os::raw::c_int,
                    buffer_ptr_2: *const std::os::raw::c_int,
                    sample_count: std::os::raw::c_int,
                    data: *const std::os::raw::c_void,
                ) {
                    let data = unsafe { &mut *(data as *mut AsioCallbackData) };
                    let samples_1 =
                        unsafe { std::slice::from_raw_parts(buffer_ptr_1, sample_count as usize) };
                    let converted_samples_1: Vec<_> = samples_1
                        .iter()
                        .map(|sample| *sample as f32 / i32::MAX as f32)
                        .collect();
                    data.pitch_tx_1.push_slice(&converted_samples_1);
                    for sample in converted_samples_1 {
                        for _ in 0..data.output_channels {
                            if data.output_tx_1.push(sample).is_err() {
                                eprintln!("output fell behind!");
                            }
                        }
                    }
                    let samples_2 =
                        unsafe { std::slice::from_raw_parts(buffer_ptr_2, sample_count as usize) };
                    let converted_samples_2: Vec<_> = samples_2
                        .iter()
                        .map(|sample| *sample as f32 / i32::MAX as f32)
                        .collect();
                    data.pitch_tx_2.push_slice(&converted_samples_2);
                    for sample in converted_samples_2 {
                        for _ in 0..data.output_channels {
                            if data.output_tx_2.push(sample).is_err() {
                                eprintln!("output fell behind!");
                            }
                        }
                    }
                }

                let callback_data = Box::into_raw(Box::new(AsioCallbackData {
                    output_channels,
                    output_tx_1,
                    output_tx_2,
                    pitch_tx_1,
                    pitch_tx_2,
                }));

                let callback_data_ptr =
                    CallbackDataPtr(callback_data as *const std::os::raw::c_void);

                std::thread::spawn(move || {
                    unsafe {
                        let driver_name = std::ffi::CString::new(name).unwrap();
                        start(driver_name.as_ptr(), sample_handler, callback_data_ptr.0)
                    };
                });

                InputStream::Asio(callback_data)
            } else {
                let input_device = default_host
                    .input_devices()?
                    .find(|device| device.name().unwrap() == name)
                    .ok_or(format!("Could not find device: {}", name))?;

                let input_config = input_device.default_input_config()?.config();

                let input_stream = input_device.build_input_stream(
                    &input_config,
                    move |samples: &[f32], _| {
                        for sample in samples {
                            for _ in 0..output_channels {
                                if output_tx_1.push(*sample).is_err() {
                                    eprintln!("output fell behind!");
                                }
                            }
                        }
                    },
                    |e| std::panic!("{}", e),
                )?;
                input_stream.play()?;

                InputStream::Default(input_stream)
            }
        };

        let pitch_detector_1 = aubio_rs::Pitch::new(
            aubio_rs::PitchMode::Yinfast,
            pitch_sample_count,
            pitch_sample_count,
            sample_rate,
        )?
        .with_unit(aubio_rs::PitchUnit::Midi);
        let pitch_detector_2 = aubio_rs::Pitch::new(
            aubio_rs::PitchMode::Yinfast,
            pitch_sample_count,
            pitch_sample_count,
            sample_rate,
        )?
        .with_unit(aubio_rs::PitchUnit::Midi);

        let output_stream_1 = output_device.build_output_stream(
            &output_config,
            move |samples: &mut [f32], _| {
                let mut echo_samples = vec![0.0; samples.len()];
                echo_rx_1.pop_slice(echo_samples.as_mut_slice());
                let samples_read = output_rx_1.pop_slice(samples);
                if samples_read < samples.len() {
                    eprintln!("input fell behind");
                }
                samples
                    .iter_mut()
                    .zip(echo_samples.iter())
                    .for_each(|(s, e)| *s += e * ECHO_AMPLITUDE);
                echo_tx_1.push_slice(samples);
            },
            |e| std::panic!("{}", e),
        )?;
        output_stream_1.play()?;
        let output_stream_2 = output_device.build_output_stream(
            &output_config,
            move |samples: &mut [f32], _| {
                let mut echo_samples = vec![0.0; samples.len()];
                echo_rx_2.pop_slice(echo_samples.as_mut_slice());
                let samples_read = output_rx_2.pop_slice(samples);
                if samples_read < samples.len() {
                    eprintln!("input fell behind");
                }
                samples
                    .iter_mut()
                    .zip(echo_samples.iter())
                    .for_each(|(s, e)| *s += e * ECHO_AMPLITUDE);
                echo_tx_2.push_slice(samples);
            },
            |e| std::panic!("{}", e),
        )?;
        output_stream_2.play()?;

        Ok(Self {
            input_stream: Arc::new(Mutex::new(input_stream)),
            output_stream_1: Arc::new(Mutex::new(output_stream_1)),
            output_stream_2: Arc::new(Mutex::new(output_stream_2)),
            pitch_rx_1,
            pitch_rx_2,
            pitch_sample_count: pitch_sample_count,
            pitch_detector_1: Arc::new(Mutex::new(pitch_detector_1)),
            pitch_detector_2: Arc::new(Mutex::new(pitch_detector_2)),
        })
    }
}
