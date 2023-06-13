/* tslint:disable:max-classes-per-file */

import FFT from "fft.js";

/** Adapted from https://github.com/olvb/phaze */

const WEBAUDIO_BLOCK_SIZE = 128;
const BUFFERED_BLOCK_SIZE = 2048;

/** Overlap-Add Node */
class OLAProcessor extends AudioWorkletProcessor {
  nbInputs: number;
  nbOutputs: number;
  blockSize: number;
  hopSize: number;
  nbOverlaps: number;

  inputBuffers: Float32Array[][];
  inputBuffersHead: Float32Array[][];
  inputBuffersToSend: Float32Array[][];

  outputBuffers: Float32Array[][];
  outputBuffersToRetrieve: Float32Array[][];

  constructor(options: any) {
    // @ts-expect-error for some reason the method signature is wrong in @types/audioworklet...
    super(options);

    this.nbInputs = options.numberOfInputs;
    this.nbOutputs = options.numberOfOutputs;

    this.blockSize = options.processorOptions.blockSize;
    // TODO for now, the only support hop size is the size of a web audio block
    this.hopSize = WEBAUDIO_BLOCK_SIZE;

    this.nbOverlaps = this.blockSize / this.hopSize;

    // pre-allocate input buffers (will be reallocated if needed)
    this.inputBuffers = new Array(this.nbInputs);
    this.inputBuffersHead = new Array(this.nbInputs);
    this.inputBuffersToSend = new Array(this.nbInputs);
    // default to 1 channel per input until we know more
    for (let i = 0; i < this.nbInputs; i++) {
      this.allocateInputChannels(i, 1);
    }
    // pre-allocate input buffers (will be reallocated if needed)
    this.outputBuffers = new Array(this.nbOutputs);
    this.outputBuffersToRetrieve = new Array(this.nbOutputs);
    // default to 1 channel per output until we know more
    for (let i = 0; i < this.nbOutputs; i++) {
      this.allocateOutputChannels(i, 1);
    }
  }

  /**
   * Handles dynamic reallocation of input/output channels buffer. (channel numbers may vary during lifecycle)
   */
  reallocateChannelsIfNeeded(
    inputs: Float32Array[][],
    outputs: Float32Array[][]
  ) {
    for (let i = 0; i < this.nbInputs; i++) {
      const nbChannels = inputs[i].length;
      if (nbChannels !== this.inputBuffers[i].length) {
        this.allocateInputChannels(i, nbChannels);
      }
    }

    for (let i = 0; i < this.nbOutputs; i++) {
      const nbChannels = outputs[i].length;
      if (nbChannels !== this.outputBuffers[i].length) {
        this.allocateOutputChannels(i, nbChannels);
      }
    }
  }

  allocateInputChannels(inputIndex: number, nbChannels: number) {
    // allocate input buffers

    this.inputBuffers[inputIndex] = new Array(nbChannels);
    for (let i = 0; i < nbChannels; i++) {
      this.inputBuffers[inputIndex][i] = new Float32Array(
        this.blockSize + WEBAUDIO_BLOCK_SIZE
      );
      this.inputBuffers[inputIndex][i].fill(0);
    }

    // allocate input buffers to send and head pointers to copy from
    // (cannot directly send a pointer/subarray because input may be modified)
    this.inputBuffersHead[inputIndex] = new Array(nbChannels);
    this.inputBuffersToSend[inputIndex] = new Array(nbChannels);
    for (let i = 0; i < nbChannels; i++) {
      this.inputBuffersHead[inputIndex][i] = this.inputBuffers[inputIndex][
        i
      ].subarray(0, this.blockSize);
      this.inputBuffersToSend[inputIndex][i] = new Float32Array(this.blockSize);
    }
  }

  allocateOutputChannels(outputIndex: number, nbChannels: number) {
    // allocate output buffers
    this.outputBuffers[outputIndex] = new Array(nbChannels);
    for (let i = 0; i < nbChannels; i++) {
      this.outputBuffers[outputIndex][i] = new Float32Array(this.blockSize);
      this.outputBuffers[outputIndex][i].fill(0);
    }

    // allocate output buffers to retrieve
    // (cannot send a pointer/subarray because new output has to be add to exising output)
    this.outputBuffersToRetrieve[outputIndex] = new Array(nbChannels);
    for (let i = 0; i < nbChannels; i++) {
      this.outputBuffersToRetrieve[outputIndex][i] = new Float32Array(
        this.blockSize
      );
      this.outputBuffersToRetrieve[outputIndex][i].fill(0);
    }
  }

  /**
   * Read next web audio block to input buffers
   */
  readInputs(inputs: Float32Array[][]) {
    // when playback is paused, we may stop receiving new samples
    if (inputs[0].length && inputs[0][0].length === 0) {
      for (let i = 0; i < this.nbInputs; i++) {
        for (const buffer of this.inputBuffers[i]) {
          buffer.fill(0, this.blockSize);
        }
      }
      return;
    }

    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        const webAudioBlock = inputs[i][j];
        this.inputBuffers[i][j].set(webAudioBlock, this.blockSize);
      }
    }
  }

  /**
   * Write next web audio block from output buffers
   */
  writeOutputs(outputs: Float32Array[][]) {
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        const webAudioBlock = this.outputBuffers[i][j].subarray(
          0,
          WEBAUDIO_BLOCK_SIZE
        );
        outputs[i][j].set(webAudioBlock);
      }
    }
  }

  /**
   * Shift left content of input buffers to receive new web audio block
   */
  shiftInputBuffers() {
    for (let i = 0; i < this.nbInputs; i++) {
      for (const buffer of this.inputBuffers[i]) {
        buffer.copyWithin(0, WEBAUDIO_BLOCK_SIZE);
      }
    }
  }

  /**
   * Shift left content of output buffers to receive new web audio block
   */
  shiftOutputBuffers() {
    for (let i = 0; i < this.nbOutputs; i++) {
      for (const buffer of this.outputBuffers[i]) {
        buffer.copyWithin(0, WEBAUDIO_BLOCK_SIZE);
        buffer.subarray(this.blockSize - WEBAUDIO_BLOCK_SIZE).fill(0);
      }
    }
  }

  /**
   * Copy contents of input buffers to buffer actually sent to process
   */
  prepareInputBuffersToSend() {
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffersToSend[i][j].set(this.inputBuffersHead[i][j]);
      }
    }
  }

  /**
   * Add contents of output buffers just processed to output buffers
   */
  handleOutputBuffersToRetrieve() {
    for (let i = 0; i < this.nbOutputs; i++) {
      for (let j = 0; j < this.outputBuffers[i].length; j++) {
        for (let k = 0; k < this.blockSize; k++) {
          this.outputBuffers[i][j][k] +=
            this.outputBuffersToRetrieve[i][j][k] / this.nbOverlaps;
        }
      }
    }
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], params: any) {
    this.reallocateChannelsIfNeeded(inputs, outputs);

    this.readInputs(inputs);
    this.shiftInputBuffers();
    this.prepareInputBuffersToSend();
    this.processOLA(
      this.inputBuffersToSend,
      this.outputBuffersToRetrieve,
      params
    );
    this.handleOutputBuffersToRetrieve();
    this.writeOutputs(outputs);
    this.shiftOutputBuffers();

    return true;
  }

  processOLA(inputs: Float32Array[][], outputs: Float32Array[][], params: any) {
    console.assert(false, "Not overriden");
  }
}

function genHannWindow(length: number) {
  const win = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / length));
  }
  return win;
}

class PhaseVocoderProcessor extends OLAProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "pitchFactor",
        defaultValue: 1.0,
      },
    ];
  }

  fftSize: number;
  timeCursor: number;
  hannWindow: Float32Array;

  fft: FFT;
  freqComplexBuffer: any;
  freqComplexBufferShifted: any;
  timeComplexBuffer: any;
  magnitudes: Float32Array;
  peakIndexes: Int32Array;
  nbPeaks: number;

  constructor(options: any) {
    options.processorOptions = {
      blockSize: BUFFERED_BLOCK_SIZE,
    };
    super(options);

    this.fftSize = this.blockSize;
    this.timeCursor = 0;

    this.hannWindow = genHannWindow(this.blockSize);

    // prepare FFT and pre-allocate buffers
    this.fft = new FFT(this.fftSize);
    this.freqComplexBuffer = this.fft.createComplexArray();
    this.freqComplexBufferShifted = this.fft.createComplexArray();
    this.timeComplexBuffer = this.fft.createComplexArray();
    this.magnitudes = new Float32Array(this.fftSize / 2 + 1);
    this.peakIndexes = new Int32Array(this.magnitudes.length);
    this.nbPeaks = 0;

    console.log("audio worklet module loaded haha");
  }

  processOLA(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: any
  ) {
    // no automation, take last value
    const pitchFactor =
      parameters.pitchFactor[parameters.pitchFactor.length - 1];

    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < inputs[i].length; j++) {
        // big assumption here: output is symetric to input
        const input = inputs[i][j];
        const output = outputs[i][j];

        this.applyHannWindow(input);

        this.fft.realTransform(this.freqComplexBuffer, input);

        this.computeMagnitudes();
        this.findPeaks();
        this.shiftPeaks(pitchFactor);

        this.fft.completeSpectrum(this.freqComplexBufferShifted);
        this.fft.inverseTransform(
          this.timeComplexBuffer,
          this.freqComplexBufferShifted
        );
        this.fft.fromComplexArray(this.timeComplexBuffer, output);

        this.applyHannWindow(output);
      }
    }

    this.timeCursor += this.hopSize;
  }

  /**
   * Apply Hann window in-place
   */
  applyHannWindow(input: Float32Array) {
    for (let i = 0; i < this.blockSize; i++) {
      input[i] = input[i] * this.hannWindow[i];
    }
  }

  /**
   * Compute squared magnitudes for peak finding
   */
  computeMagnitudes() {
    let i = 0;
    let j = 0;
    while (i < this.magnitudes.length) {
      const real = this.freqComplexBuffer[j];
      const imag = this.freqComplexBuffer[j + 1];
      // no need to sqrt for peak finding
      this.magnitudes[i] = real ** 2 + imag ** 2;
      i += 1;
      j += 2;
    }
  }

  /**
   * Find peaks in spectrum magnitudes
   */
  findPeaks() {
    this.nbPeaks = 0;
    let i = 2;
    const end = this.magnitudes.length - 2;

    while (i < end) {
      const mag = this.magnitudes[i];

      if (this.magnitudes[i - 1] >= mag || this.magnitudes[i - 2] >= mag) {
        i++;
        continue;
      }
      if (this.magnitudes[i + 1] >= mag || this.magnitudes[i + 2] >= mag) {
        i++;
        continue;
      }

      this.peakIndexes[this.nbPeaks] = i;
      this.nbPeaks++;
      i += 2;
    }
  }

  /**
   * Shift peaks and regions of influence by pitchFactor into new spectrum
   */
  shiftPeaks(pitchFactor: number) {
    // zero-fill new spectrum
    this.freqComplexBufferShifted.fill(0);

    for (let i = 0; i < this.nbPeaks; i++) {
      const peakIndex = this.peakIndexes[i];
      const peakIndexShifted = Math.round(peakIndex * pitchFactor);

      if (peakIndexShifted > this.magnitudes.length) {
        break;
      }

      // find region of influence
      let startIndex = 0;
      let endIndex = this.fftSize;
      if (i > 0) {
        const peakIndexBefore = this.peakIndexes[i - 1];
        startIndex = peakIndex - Math.floor((peakIndex - peakIndexBefore) / 2);
      }
      if (i < this.nbPeaks - 1) {
        const peakIndexAfter = this.peakIndexes[i + 1];
        endIndex = peakIndex + Math.ceil((peakIndexAfter - peakIndex) / 2);
      }

      // shift whole region of influence around peak to shifted peak
      const startOffset = startIndex - peakIndex;
      const endOffset = endIndex - peakIndex;
      for (let j = startOffset; j < endOffset; j++) {
        const binIndex = peakIndex + j;
        const binIndexShifted = peakIndexShifted + j;

        if (binIndexShifted >= this.magnitudes.length) {
          break;
        }

        // apply phase correction
        const omegaDelta =
          (2 * Math.PI * (binIndexShifted - binIndex)) / this.fftSize;
        const phaseShiftReal = Math.cos(omegaDelta * this.timeCursor);
        const phaseShiftImag = Math.sin(omegaDelta * this.timeCursor);

        const indexReal = binIndex * 2;
        const indexImag = indexReal + 1;
        const valueReal = this.freqComplexBuffer[indexReal];
        const valueImag = this.freqComplexBuffer[indexImag];

        const valueShiftedReal =
          valueReal * phaseShiftReal - valueImag * phaseShiftImag;
        const valueShiftedImag =
          valueReal * phaseShiftImag + valueImag * phaseShiftReal;

        const indexShiftedReal = binIndexShifted * 2;
        const indexShiftedImag = indexShiftedReal + 1;
        this.freqComplexBufferShifted[indexShiftedReal] += valueShiftedReal;
        this.freqComplexBufferShifted[indexShiftedImag] += valueShiftedImag;
      }
    }
  }
}

registerProcessor("phase-vocoder", PhaseVocoderProcessor);

export {};
