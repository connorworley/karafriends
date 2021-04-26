use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

pub struct InputStream {
    _stream: cpal::platform::Stream,
    rx: futures::channel::mpsc::UnboundedReceiver<f32>,
}

impl futures::Stream for InputStream {
    type Item = f32;
    fn poll_next(
        mut self: core::pin::Pin<&mut Self>,
        cx: &mut futures::task::Context<'_>,
    ) -> futures::task::Poll<Option<Self::Item>> {
        core::pin::Pin::new(&mut self.rx).poll_next(cx)
    }
}

pub fn input_stream() -> Result<(impl futures::Stream<Item = f32>, u32), Box<dyn std::error::Error>>
{
    let host = cpal::default_host();

    let input_device = host
        .default_input_device()
        .ok_or("No default input device")?;
    let input_config = input_device.default_input_config()?;
    let sample_rate = input_config.sample_rate().0;

    let (mut tx, rx) = futures::channel::mpsc::unbounded();

    let stream = input_device.build_input_stream(
        &input_config.into(),
        move |samples: &[f32], _| {
            for sample in samples {
                tx.start_send(*sample).unwrap();
            }
        },
        |e| std::panic::panic_any(e),
    )?;

    stream.play()?;

    Ok((
        InputStream {
            _stream: stream,
            rx,
        },
        sample_rate,
    ))
}
