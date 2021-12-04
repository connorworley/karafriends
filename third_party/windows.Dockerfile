FROM ubuntu:xenial
RUN apt-get update && apt-get install -y curl build-essential mingw-w64 python pkg-config automake libtool
RUN curl -sSL http://www.fftw.org/fftw-3.3.9.tar.gz | tar -zxvf- -C /opt
RUN curl -sSL https://github.com/aubio/aubio/archive/refs/tags/0.4.9.tar.gz | tar -zxvf- -C /opt
RUN curl -sSL https://github.com/libsndfile/libsamplerate/archive/refs/tags/0.2.1.tar.gz | tar -zxvf- -C /opt
RUN curl -sSL https://github.com/libffi/libffi/releases/download/v3.4.2/libffi-3.4.2.tar.gz  | tar -zxvf- -C /opt