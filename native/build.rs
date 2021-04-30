#![allow(unreachable_code)]

pub fn main() {
    neon_build::setup();

    #[cfg(windows)]
    {
        println!("cargo:rustc-link-search=../prebuilt/windows");
        println!("cargo:rustc-link-lib=static=libaubio");
        println!("cargo:rustc-link-lib=static=libfftw3f");

        #[cfg(feature = "winrt")]
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

        return;
    }
}
