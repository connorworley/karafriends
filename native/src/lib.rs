#![allow(non_snake_case)]

mod audio_processor;
mod list_input_devices;

use std::cell::RefCell;
use std::cmp::Ordering;
use std::sync::{Arc, Mutex};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use neon::prelude::*;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

impl Finalize for audio_processor::AudioProcessor {}

struct Resampler {
    resampler: aubio_rs::Resampler,
}

unsafe impl Send for Resampler {}

fn input_devices(mut cx: FunctionContext) -> JsResult<JsArray> {
    let input_devices = match list_input_devices::list_input_devices() {
        Ok(devices) => devices,
        Err(e) => return cx.throw_error(e.to_string()),
    };
    let js_array = JsArray::new(&mut cx, input_devices.len() as u32);
    for (i, device_info) in input_devices.into_iter().enumerate() {
        let js_name = cx.string(device_info.name);
        let js_is_asio = cx.boolean(device_info.is_asio);
        let inner_array = JsArray::new(&mut cx, 2);
        inner_array.set(&mut cx, 0, js_name)?;
        inner_array.set(&mut cx, 1, js_is_asio)?;
        js_array.set(&mut cx, i as u32, inner_array)?;
    }
    Ok(js_array)
}

fn input_device__new(
    mut cx: FunctionContext,
) -> JsResult<JsBox<RefCell<audio_processor::AudioProcessor>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let is_asio = cx.argument::<JsBoolean>(1)?.value(&mut cx);
    let device = match audio_processor::AudioProcessor::new(name, is_asio) {
        Ok(device) => device,
        Err(e) => return cx.throw_error(e.to_string()),
    };
    Ok(cx.boxed(RefCell::new(device)))
}

fn input_device__get_pitch(mut cx: FunctionContext) -> JsResult<JsObject> {
    let device = cx.argument::<JsBox<RefCell<audio_processor::AudioProcessor>>>(0)?;
    let left = cx.argument::<JsBoolean>(1)?.value(&mut cx);
    let mut device = device.borrow_mut();
    let (midi_number, confidence) = match device.get_pitch(left) {
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
    let device = cx.argument::<JsBox<RefCell<audio_processor::AudioProcessor>>>(0)?;
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
