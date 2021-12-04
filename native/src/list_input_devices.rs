use cpal::traits::{DeviceTrait, HostTrait};

pub struct InputDeviceInfo {
    pub name: String,
    pub is_asio: bool,
}

pub fn list_input_devices() -> crate::Result<Vec<InputDeviceInfo>> {
    let default_host = cpal::default_host();
    let default_devices = default_host.input_devices()?.map(|device| InputDeviceInfo {
        name: device.name().unwrap(),
        is_asio: false,
    });

    Ok({
        if cfg!(feature = "asio") {
            default_devices
                .chain({
                    // let asio = asio_sys::Asio::new();
                    // asio.driver_names()
                    ["Focusrite USB ASIO"].iter().map(|name| InputDeviceInfo {
                        name: name.to_string(),
                        is_asio: true,
                    })
                })
                .collect()
        } else {
            default_devices.collect()
        }
    })
}
