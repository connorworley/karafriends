#![allow(non_snake_case)]

#[cfg(not(feature = "winrt"))]
mod cpal;
#[cfg(not(feature = "winrt"))]
use crate::cpal::AudioSystem;
#[cfg(feature = "winrt")]
mod winrt;
#[cfg(feature = "winrt")]
use winrt::AudioSystem;
mod traits;

use std::cell::RefCell;

use neon::prelude::*;

use traits::{AudioSystemTrait, InputDeviceTrait};

type InputDevice = <AudioSystem as AudioSystemTrait>::InputDevice;

fn input_devices(mut cx: FunctionContext) -> JsResult<JsArray> {
    let input_devices = AudioSystem::input_devices();
    let js_array = JsArray::new(&mut cx, input_devices.len() as u32);
    for (i, name) in input_devices.iter().enumerate() {
        let js_string = cx.string(name);
        js_array.set(&mut cx, i as u32, js_string)?;
    }
    Ok(js_array)
}

fn output_devices(mut cx: FunctionContext) -> JsResult<JsArray> {
    let output_devices = AudioSystem::output_devices();
    let js_array = JsArray::new(&mut cx, output_devices.len() as u32);
    for (i, name) in output_devices.iter().enumerate() {
        let js_string = cx.string(name);
        js_array.set(&mut cx, i as u32, js_string)?;
    }
    Ok(js_array)
}

fn input_device__new(mut cx: FunctionContext) -> JsResult<JsBox<RefCell<InputDevice>>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    Ok(cx.boxed(RefCell::new(AudioSystem::new_input_device(&name))))
}

fn input_device__get_pitch(mut cx: FunctionContext) -> JsResult<JsObject> {
    let device = cx.argument::<JsBox<RefCell<InputDevice>>>(0)?;
    let mut device = device.borrow_mut();
    let (frequency, confidence) = device.get_pitch();
    let js_object = JsObject::new(&mut cx);
    let frequency = cx.number(frequency);
    let confidence = cx.number(confidence);
    js_object.set(&mut cx, "frequency", frequency)?;
    js_object.set(&mut cx, "confidence", confidence)?;
    Ok(js_object)
}

register_module!(mut m, {
    m.export_function("inputDevices", input_devices)?;
    m.export_function("outputDevices", output_devices)?;
    m.export_function("inputDevice_new", input_device__new)?;
    m.export_function("inputDevice_getPitch", input_device__get_pitch)?;
    Ok(())
});
