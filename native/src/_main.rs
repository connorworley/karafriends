// use asio_sys::asio_import::ASIOError;

// extern "C" {
//     #[link_name = "\u{1}__Z16ASIOControlPanelv"]
//     fn ASIOControlPanel() -> ASIOError;
// }

// fn main() {
//     let asio = asio_sys::Asio::new();
//     println!("{:?}", asio.driver_names());
//     let driver = asio.load_driver("Focusrite USB ASIO").unwrap();
//     unsafe { ASIOControlPanel(); }
//     driver.add_callback(|info| println!("{:?}", info));
//     let stream = driver.prepare_input_stream(None, 2, None).unwrap().input.unwrap();
//     driver.start().unwrap();
//     std::thread::park();
// }

// use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

// type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

// fn main() -> Result<()> {
//     let host = cpal::host_from_id(cpal::HostId::Asio)?;
//     let input_device = host
//         .input_devices()?
//         .find(|device| device.name().unwrap() == "Focusrite USB ASIO")
//         .ok_or(format!("Could not find device"))?;

//     let input_stream = input_device.build_input_stream(
//         &cpal::StreamConfig {
//             buffer_size: cpal::BufferSize::Default,
//             sample_rate: cpal::SampleRate(48000),
//             channels: 2,
//         },
//         move |samples: &[i16], _| {
//             eprintln!("{:?}", samples);
//         },
//         |e| std::panic!("{}", e),
//     )?;
//     input_stream.play()?;
//     std::thread::park();
//     Ok(())
// }
