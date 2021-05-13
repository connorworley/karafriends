#![allow(unreachable_code)]

pub fn main() {
    neon_build::setup();

    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-search=../prebuilt/macos");
        println!("cargo:rustc-link-lib=aubio");
        println!("cargo:rustc-link-lib=fftw3f");
        println!("cargo:rustc-link-lib=samplerate");
    } else if cfg!(windows) {
        println!("cargo:rustc-link-search=../prebuilt/windows");
        println!("cargo:rustc-link-lib=static=libaubio");
        println!("cargo:rustc-link-lib=static=libfftw3f");
    } else {
        println!("cargo:rustc-link-lib=aubio");
    }
}
