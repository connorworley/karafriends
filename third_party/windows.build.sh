#!/bin/sh
set -ex

if [ -f /.dockerenv ]; then
    cd /opt/fftw-3.3.9
    ./configure --host=x86_64-w64-mingw32 --with-our-malloc --enable-single --enable-float --enable-sse2 --enable-avx --enable-static --disable-doc
    make
    make install
    cp .libs/libfftw3f.a /out/libfftw3f.lib
    cd /opt/aubio-0.4.9
    patch -p1 < /code/aubio.patch
    ./scripts/get_waf.sh
    CC="x86_64-w64-mingw32-gcc" LDFLAGS="-lwinpthread" ./waf configure --enable-fftw3 --disable-tests --disable-docs --disable-examples --verbose
    CC="x86_64-w64-mingw32-gcc" LDFLAGS="-lwinpthread" ./waf build --enable-fftw3 --disable-tests --disable-docs --disable-examples --verbose
    cp build/src/libaubio.a /out/libaubio.lib
else
    docker build -t karafriends-third_party-windows -f windows.Dockerfile .
    docker run -v $(pwd):/code -v $(pwd)/../prebuilt/windows:/out karafriends-third_party-windows /code/windows.build.sh
fi
