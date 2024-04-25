use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::Command;

use dirs;
use env_logger::Builder;
use log::{info, LevelFilter};

fn main() {
    env::set_var("RUST_BACKTRACE", "1");
    Builder::new().filter_level(LevelFilter::Info).init();
    info!("Starting wrapper");

    // If there is no desktop directory this platform is unusable for karafriends anyway
    let mut tools_dir = dirs::desktop_dir().unwrap();
    tools_dir.push("karafriends-tools");
    let tools_dir_s = tools_dir.display();
    info!("Tool directory: {tools_dir_s}");

    if tools_dir.exists() {
        info!("Tool directory already exists, doing nothing");
    } else {
        info!("Creating tool directory");
        let res = fs::create_dir(&tools_dir);
        res.unwrap();
    }

    download_ffmpeg(tools_dir.clone());
    download_ytdlp(tools_dir.clone());

    info!("All done");

    // TODO: Launch karafriends here, or keep this downloader separate?
}

#[cfg(target_os = "macos")]
fn download_ffmpeg(tools_dir: PathBuf) {
    info!("Downloading ffmpeg");
    // These people always recommend the snapshot build
    let resp = reqwest::blocking::get("https://evermeet.cx/ffmpeg/get").unwrap();

    let status = resp.status();
    let body = resp.bytes().unwrap();
    if !status.is_success() {
        panic!("Response from evermeet.cx was not successful ({status}): {body:?}");
    }

    let body_cursor = std::io::Cursor::new(body);

    let mut ffmpeg_path = tools_dir.clone();
    ffmpeg_path.push("ffmpeg");

    info!("Decompressing ffmpeg");
    sevenz_rust::decompress(body_cursor, tools_dir).unwrap();

    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&ffmpeg_path, fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Can take a while on first invocation
    info!("Testing ffmpeg");
    Command::new(ffmpeg_path)
        .arg("-version")
        .status()
        .expect("Shows version");
}

#[cfg(target_os = "macos")]
fn download_ytdlp(tools_dir: PathBuf) {
    info!("Downloading yt-dlp");
    let resp = reqwest::blocking::get(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    )
    .unwrap();

    let status = resp.status();
    let body = resp.bytes().unwrap();
    if !status.is_success() {
        panic!("Response from github was not successful ({status}): {body:?}");
    }

    let mut ytdlp_path = tools_dir;
    ytdlp_path.push("yt-dlp");

    let mut ytdlp_fh = fs::File::create(&ytdlp_path).unwrap();

    let mut body_cursor = std::io::Cursor::new(body);
    io::copy(&mut body_cursor, &mut ytdlp_fh).unwrap();

    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&ytdlp_path, fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Can take a while on first invocation
    Command::new(ytdlp_path)
        .arg("--version")
        .status()
        .expect("Shows version");
}
