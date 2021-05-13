#![allow(non_snake_case)]

use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::*;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

const ECHO_DELAY_SECS: f32 = 0.075;
const ECHO_AMPLITUDE: f32 = 0.25;

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
            .map(|device| device.name().unwrap())
            .collect())
    }) {
        Ok(devices) => devices,
        Err(e) => return cx.throw_error(e.to_string()),
    };
    let js_array = JsArray::new(&mut cx, input_devices.len() as u32);
    for (i, name) in input_devices.iter().enumerate() {
        let js_string = cx.string(name);
        js_array.set(&mut cx, i as u32, js_string)?;
    }
    Ok(js_array)
}

fn input_device__new(mut cx: FunctionContext) -> JsResult<JsBox<RefCell<InputDevice>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let device = match cpal_safe(move || -> Result<InputDevice> {
        let host = cpal::default_host();
        let input_device = host
            .input_devices()?
            .find(|device| device.name().unwrap() == name)
            .ok_or(format!("Could not find device: {}", name))?;
        let mut input_config = input_device.default_input_config()?.config();
        input_config.channels = 1;

        let output_device = host
            .default_output_device()
            .ok_or("No default output device")?;
        let output_config = output_device.default_output_config()?.config();
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
            ringbuf::RingBuffer::new(1024 * output_channels).split();

        let sample_ratio = output_config.sample_rate.0 as f32 / sample_rate as f32;
        let mut resampler = Resampler {
            resampler: aubio_rs::Resampler::new(sample_ratio, aubio_rs::ResampleMode::BestQuality)?,
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
                for sample in resampled_output_samples {
                    for _ in 0..output_channels {
                        output_tx.push(sample).unwrap();
                    }
                }
            },
            |e| std::panic!("{}", e),
        )?;

        let output_stream = output_device.build_output_stream(
            &output_config,
            move |samples: &mut [f32], _| {
                output_rx.pop_slice(samples);
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
