#![allow(non_snake_case)]

use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::*;

const ECHO_DELAY_SECS: f32 = 0.075;
const ECHO_AMPLITUDE: f32 = 0.25;

struct InputDevice {
    _input_stream: Arc<Mutex<cpal::platform::Stream>>,
    _output_stream: Arc<Mutex<cpal::platform::Stream>>,
    pitch_rx: ringbuf::Consumer<f32>,
    pitch_sample_count: usize,
    pitch_detector: Arc<Mutex<aubio_rs::Pitch>>,
}

unsafe impl Send for InputDevice {}

impl Finalize for InputDevice {}

impl InputDevice {
    fn get_pitch(&mut self) -> (f32, f32) {
        let mut samples = vec![0.0; self.pitch_sample_count];
        self.pitch_rx.pop_slice(&mut samples);
        let mut pd = self.pitch_detector.lock().unwrap();
        let midi_number = pd.do_result(&samples).unwrap();
        (midi_number, pd.get_confidence())
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
    let input_devices: Vec<_> = cpal_safe(|| {
        let host = cpal::default_host();
        host.input_devices()
            .unwrap()
            .map(|device| device.name().unwrap())
            .collect()
    });
    let js_array = JsArray::new(&mut cx, input_devices.len() as u32);
    for (i, name) in input_devices.iter().enumerate() {
        let js_string = cx.string(name);
        js_array.set(&mut cx, i as u32, js_string)?;
    }
    Ok(js_array)
}

fn input_device__new(mut cx: FunctionContext) -> JsResult<JsBox<RefCell<InputDevice>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let device = cpal_safe(move || {
        let host = cpal::default_host();
        let input_device = host
            .input_devices()
            .unwrap()
            .find(|device| device.name().unwrap() == name)
            .unwrap();
        let mut input_config = input_device.default_input_config().unwrap().config();
        input_config.channels = 1;

        let output_device = host.default_output_device().unwrap();
        let mut output_config = output_device.default_output_config().unwrap().config();
        output_config.channels = 1;

        let sample_rate = input_config.sample_rate.0;

        let pitch_sample_count = (sample_rate / 40) as usize;
        let (mut pitch_tx, pitch_rx) = ringbuf::RingBuffer::new(pitch_sample_count).split();

        let latency_sample_count = (sample_rate as f32 * ECHO_DELAY_SECS) as usize;
        let (mut echo_tx, mut echo_rx) = ringbuf::RingBuffer::new(latency_sample_count * 2).split();
        for _ in 0..latency_sample_count {
            echo_tx.push(0.0).unwrap();
        }

        let (mut output_tx, mut output_rx) =
            ringbuf::RingBuffer::new(latency_sample_count * 2).split();
        for _ in 0..latency_sample_count {
            output_tx.push(0.0).unwrap();
        }

        let sample_ratio = output_config.sample_rate.0 as f32 / sample_rate as f32;
        let mut resampler = Resampler {
            resampler: aubio_rs::Resampler::new(sample_ratio, aubio_rs::ResampleMode::BestQuality)
                .unwrap(),
        };

        let pitch_detector = aubio_rs::Pitch::new(
            aubio_rs::PitchMode::Yinfast,
            pitch_sample_count,
            pitch_sample_count,
            sample_rate,
        )
        .unwrap()
        .with_unit(aubio_rs::PitchUnit::Midi);

        let input_stream = input_device
            .build_input_stream(
                &input_config,
                move |samples: &[f32], _| {
                    pitch_tx.push_slice(samples);

                    let mut echo_samples = vec![0.0; samples.len()];
                    echo_rx.pop_slice(echo_samples.as_mut_slice());

                    let output_samples: Vec<_> = samples
                        .iter()
                        .zip(echo_samples.iter().map(|sample| sample * ECHO_AMPLITUDE))
                        .map(|(incoming, echo)| incoming + echo)
                        .collect();

                    echo_tx.push_slice(output_samples.as_slice());

                    let mut resampled_output_samples =
                        vec![0.0; (output_samples.len() as f32 * sample_ratio) as usize];
                    resampler
                        .resampler
                        .do_(output_samples, &mut resampled_output_samples)
                        .unwrap();
                    output_tx.push_slice(resampled_output_samples.as_slice());
                },
                |e| std::panic!("{}", e),
            )
            .unwrap();

        let output_stream = output_device
            .build_output_stream(
                &output_config,
                move |samples: &mut [f32], _| {
                    output_rx.pop_slice(samples);
                },
                |e| std::panic!("{}", e),
            )
            .unwrap();

        input_stream.play().unwrap();
        output_stream.play().unwrap();

        InputDevice {
            _input_stream: Arc::new(Mutex::new(input_stream)),
            _output_stream: Arc::new(Mutex::new(output_stream)),
            pitch_rx,
            pitch_sample_count,
            pitch_detector: Arc::new(Mutex::new(pitch_detector)),
        }
    });
    Ok(cx.boxed(RefCell::new(device)))
}

fn input_device__get_pitch(mut cx: FunctionContext) -> JsResult<JsObject> {
    let device = cx.argument::<JsBox<RefCell<InputDevice>>>(0)?;
    let mut device = device.borrow_mut();
    let (midi_number, confidence) = device.get_pitch();
    let js_object = JsObject::new(&mut cx);
    let midi_number = cx.number(midi_number);
    let confidence = cx.number(confidence);
    js_object.set(&mut cx, "midiNumber", midi_number)?;
    js_object.set(&mut cx, "confidence", confidence)?;
    Ok(js_object)
}

register_module!(mut m, {
    m.export_function("inputDevices", input_devices)?;
    m.export_function("inputDevice_new", input_device__new)?;
    m.export_function("inputDevice_getPitch", input_device__get_pitch)?;
    Ok(())
});
