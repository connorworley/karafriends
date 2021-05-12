# karafriends

<img src="https://raw.githubusercontent.com/robertlai/karafriends/master/icon.png" width="128" />

## Building

Dependencies
* Yarn
* Rust (be sure to install `stable-x86_64-pc-windows-gnu` on Windows)
* MinGW (Windows only, must be in PATH)

## Running

Electron

```sh
yarn install && yarn start
```

## Prebuilding third-party libraries

Windows

```sh
cd third_party
.\window.build.bat  # or ./windows.build.sh
```
