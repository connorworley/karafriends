#!/bin/sh
set -ex

if [ -f /.dockerenv ]; then
    cd /opt/fftw-3.3.9
    for SINGLE_FLAG in "" "--enable-single"; do
        ./configure --host=x86_64-w64-mingw32 --with-our-malloc $SINGLE_FLAG --enable-sse2 --enable-avx --enable-static --disable-doc --disable-shared
        make -j4
        make install
    done
    cp /usr/local/lib/libfftw3.a /out/libfftw3.lib
    cp /usr/local/lib/libfftw3f.a /out/libfftw3f.lib
    cd /opt/libsamplerate-0.2.1
    autoreconf --install
    ./configure --host=x86_64-w64-mingw32 --enable-fftw --disable-shared
    make -j4
    make install
    cp /usr/local/lib/libsamplerate.a /out/libsamplerate.lib
    cd /opt/aubio-0.4.9
    patch -p1 < /code/aubio.patch
    ./scripts/get_waf.sh
    CC="x86_64-w64-mingw32-gcc" LDFLAGS="-lwinpthread" ./waf configure --enable-fftw3f --disable-tests --disable-docs --disable-examples --verbose
    CC="x86_64-w64-mingw32-gcc" LDFLAGS="-lwinpthread" ./waf build --enable-fftw3f --disable-tests --disable-docs --disable-examples --verbose
    CC="x86_64-w64-mingw32-gcc" LDFLAGS="-lwinpthread" ./waf install --enable-fftw3f --disable-tests --disable-docs --disable-examples --verbose
    cp /usr/local/lib/libaubio.a /out/libaubio.lib
else
    docker build -t karafriends-third_party-windows -f windows.Dockerfile .
    docker run -v $(pwd):/code -v $(pwd)/../prebuilt/windows:/out karafriends-third_party-windows /code/windows.build.sh
fi
