use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait};
use neon::prelude::*;

pub struct AudioSystem {}
pub struct InputDevice {
    _stream: Arc<Mutex<cpal::platform::Stream>>,
    rx: ringbuf::Consumer<f32>,
    sample_count: usize,
    pitch_detector: Arc<Mutex<aubio_rs::Pitch>>,
}

unsafe impl Send for InputDevice {}

impl crate::traits::AudioSystemTrait for AudioSystem {
    type InputDevice = InputDevice;

    fn input_devices() -> Vec<String> {
        let host = cpal::default_host();
        host.input_devices()
            .unwrap()
            .map(|device| device.name().unwrap())
            .collect()
    }

    fn output_devices() -> Vec<String> {
        let host = cpal::default_host();
        host.output_devices()
            .unwrap()
            .map(|device| device.name().unwrap())
            .collect()
    }

    fn new_input_device(name: &str) -> Self::InputDevice {
        let host = cpal::default_host();
        let device = host
            .input_devices()
            .unwrap()
            .find(|device| device.name().unwrap() == name)
            .unwrap();
        let config = device.default_input_config().unwrap();

        let sample_rate = config.sample_rate().0;
        let sample_count = (sample_rate / 40) as usize;

        let (mut tx, rx) = ringbuf::RingBuffer::new(sample_count).split();

        let pitch_detector = aubio_rs::Pitch::new(
            aubio_rs::PitchMode::Yinfast,
            sample_count,
            sample_count,
            sample_rate,
        )
        .unwrap();

        let stream = device
            .build_input_stream(
                &config.into(),
                move |samples: &[f32], _| {
                    tx.push_iter(&mut samples.iter().copied());
                },
                |e| std::panic!("{}", e),
            )
            .unwrap();

        InputDevice {
            _stream: Arc::new(Mutex::new(stream)),
            rx,
            sample_count,
            pitch_detector: Arc::new(Mutex::new(pitch_detector)),
        }
    }
}

impl Finalize for InputDevice {}

impl crate::traits::InputDeviceTrait for InputDevice {
    fn get_pitch(&mut self) -> (f32, f32) {
        let mut samples = vec![0.0; self.sample_count];
        self.rx.pop_slice(&mut samples);
        let mut pd = self.pitch_detector.lock().unwrap();
        let frequency = pd.do_result(&samples).unwrap();
        (frequency, pd.get_confidence())
    }
}
