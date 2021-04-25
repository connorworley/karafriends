pub fn main() {
    println!("cargo:rustc-link-lib=aubio");

    #[cfg(windows)]
    windows::build!(
        Windows::Foundation::IAsyncOperation,
        Windows::Foundation::Collections::IVector,
        Windows::Foundation::EventRegistrationToken,
        Windows::Foundation::IMemoryBufferReference,
        Windows::Foundation::TypedEventHandler,
        Windows::Media::*,
        Windows::Media::Audio::*,
        Windows::Media::Capture::*,
        Windows::Media::MediaProperties::*,
        Windows::Media::Render::*,
        Windows::Win32::WinRT::IMemoryBufferByteAccess,
    );
}
