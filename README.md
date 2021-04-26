# karafriends

## Running

Electron

```sh
yarn install && yarn start
```

Pitch detector

```sh
rustup toolchain add stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
cargo run
```

## Prebuilding third-party libraries

Windows

```sh
cd third_party
.\window.build.bat  # or ./windows.build.sh
```
