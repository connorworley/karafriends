#[cfg(not(feature = "winrt"))]
mod cpal;
#[cfg(feature = "winrt")]
mod winrt;

use futures::StreamExt;

fn main() {
    #[cfg(not(feature = "winrt"))]
    let (input_stream, sample_rate) = cpal::input_stream().unwrap();
    #[cfg(feature = "winrt")]
    let (input_stream, sample_rate) = winrt::input_stream().unwrap();

    // the lowest i could sing was arond 80hz  = 12.5ms period
    // we should have a 25ms period for pd

    let size = (sample_rate / 40) as usize;
    let mut detector =
        aubio_rs::Pitch::new(aubio_rs::PitchMode::Yinfast, size, size, sample_rate).unwrap();

    let pitch_printer = input_stream
        .ready_chunks(size)
        .map(|buf| (detector.do_result(&buf).unwrap(), detector.get_confidence()))
        .filter(|(pitch, confidence)| futures::future::ready(*pitch != 0.0 && *confidence > 0.8))
        .for_each(|(pitch, _)| {
            println!("Pitch: {}", pitch);
            futures::future::ready(())
        });

    println!("{:?}", futures::executor::block_on(pitch_printer));
}
