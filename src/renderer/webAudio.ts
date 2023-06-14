export default class KarafriendsAudio {
  private pitchShiftPromise: Promise<AudioWorkletNode>;

  audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
    this.pitchShiftPromise = this.audioContext.audioWorklet
      .addModule(new URL("./audio/phazeAudioWorklet.ts", import.meta.url))
      .then(() => {
        return new AudioWorkletNode(this.audioContext, "phase-vocoder");
      });
  }

  pitchShift(semitones: number) {
    (async () => {
      // @ts-expect-error i swear there's a .get method on this object.
      (await this.pitchShiftNode()).parameters.get("pitchFactor").value =
        Math.pow(2, semitones / 12);
    })().catch(console.log);
  }

  async pitchShiftNode() {
    return this.pitchShiftPromise;
  }
}
