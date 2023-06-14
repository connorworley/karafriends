export default class PitchShifter {
  private nodePromise: Promise<AudioWorkletNode>;

  audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
    this.nodePromise = this.audioContext.audioWorklet
      .addModule(new URL("./audio/phazeAudioWorklet.ts", import.meta.url))
      .then(() => {
        return new AudioWorkletNode(this.audioContext, "phase-vocoder");
      });
  }

  async pitchShiftNode() {
    return this.nodePromise;
  }
}
