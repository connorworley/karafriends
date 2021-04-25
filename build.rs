pub fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();

    #[cfg(windows)]
    {
        println!("cargo:rustc-link-search={}/windows", out_dir);
        println!("cargo:rustc-link-lib=libaubio-5");
        println!("cargo:rustc-link-lib=libfftw3f-3");
        println!("cargo:rustc-link-lib=libwinpthread-1");

        let mut copy_options = fs_extra::dir::CopyOptions::new();
        copy_options.overwrite = true;
        fs_extra::dir::copy("./prebuilt/windows", out_dir, &copy_options).unwrap();

        

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
}
