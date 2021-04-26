FROM ubuntu:xenial
RUN apt-get update && apt-get install -y curl build-essential mingw-w64 python pkg-config
RUN curl -sSL http://www.fftw.org/fftw-3.3.9.tar.gz | tar -zxvf- -C /opt
RUN curl -sSL https://github.com/aubio/aubio/archive/refs/tags/0.4.9.tar.gz | tar -zxvf- -C /opt
