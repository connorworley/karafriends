mod bindings {
    windows::include_bindings!();
}

use std::mem::MaybeUninit;

use bindings::Windows::Foundation::TypedEventHandler;
use bindings::Windows::Media::Audio::AudioGraph;
use bindings::Windows::Media::Audio::AudioGraphSettings;
use bindings::Windows::Media::Audio::QuantumSizeSelectionMode;
use bindings::Windows::Media::Audio::ReverbEffectDefinition;
use bindings::Windows::Media::AudioBufferAccessMode;
use bindings::Windows::Media::Capture::MediaCategory;
use bindings::Windows::Media::Render::AudioRenderCategory;
use bindings::Windows::Win32::WinRT::IMemoryBufferByteAccess;
use windows::Interface;

struct InputStream {
    _graph: AudioGraph,
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

async fn create_audio_graph(
    mut tx: futures::channel::mpsc::UnboundedSender<f32>,
) -> std::result::Result<(AudioGraph, u32), Box<dyn std::error::Error>> {
    let settings = AudioGraphSettings::Create(AudioRenderCategory::Media)?;
    settings.SetQuantumSizeSelectionMode(QuantumSizeSelectionMode::LowestLatency)?;

    let graph = AudioGraph::CreateAsync(settings)?.await?.Graph()?;
    let encoding_properties = graph.EncodingProperties()?;
    encoding_properties.SetChannelCount(1)?;

    let input_node = graph
        .CreateDeviceInputNodeWithFormatAsync(MediaCategory::Other, &encoding_properties)?
        .await?
        .DeviceInputNode()?;

    let output_node = graph
        .CreateDeviceOutputNodeAsync()?
        .await?
        .DeviceOutputNode()?;
    let reverb = ReverbEffectDefinition::Create(&graph)?;
    output_node.EffectDefinitions()?.Append(reverb)?;

    let frame_output_node = graph.CreateFrameOutputNodeWithFormat(&encoding_properties)?;

    input_node.AddOutgoingConnection(output_node)?;
    input_node.AddOutgoingConnection(&frame_output_node)?;

    assert_eq!(
        (encoding_properties.BitsPerSample()? >> 3) as usize,
        std::mem::size_of::<f32>()
    );

    graph.QuantumStarted(TypedEventHandler::new(move |_sender, _args| {
        let frame = frame_output_node.GetFrame()?;
        let buffer = frame.LockBuffer(AudioBufferAccessMode::Read)?;
        let reference: IMemoryBufferByteAccess = buffer.CreateReference()?.cast()?;
        let mut data_ptr = MaybeUninit::<*mut u8>::uninit();
        let mut size_in_bytes: u32 = 0;
        let samples = unsafe {
            reference
                .GetBuffer(data_ptr.as_mut_ptr(), &mut size_in_bytes as *mut u32)
                .ok()?;
            let data_ptr = data_ptr.assume_init();
            std::slice::from_raw_parts(
                data_ptr as *const f32,
                size_in_bytes as usize / std::mem::size_of::<f32>(),
            )
        };
        for sample in samples {
            tx.start_send(*sample).unwrap();
        }
        Ok(())
    }))?;

    Ok((graph, encoding_properties.SampleRate()?))
}

pub fn input_stream() -> Result<(impl futures::Stream<Item = f32>, u32), Box<dyn std::error::Error>>
{
    let (tx, rx) = futures::channel::mpsc::unbounded();

    let (graph, sample_rate) = futures::executor::block_on(create_audio_graph(tx))?;
    graph.Start()?;

    Ok((InputStream { _graph: graph, rx }, sample_rate))
}
