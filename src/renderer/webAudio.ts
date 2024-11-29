export default class KarafriendsAudio {
  private gainNode: GainNode;
  private vocoderNode: AudioWorkletNode | null;

  audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.vocoderNode = null;
    this.audioContext.audioWorklet
      .addModule(
        new URL("worklet:./audio/phazeAudioWorklet.ts", import.meta.url),
      )
      .then(
        () => {
          this.vocoderNode = new AudioWorkletNode(
            this.audioContext,
            "phase-vocoder",
          );
          this.gainNode.disconnect();
          this.gainNode.connect(this.vocoderNode);
          this.vocoderNode.connect(this.audioContext.destination);
        },
        (e) => {
          console.log(
            "could not load pitch shift audio worklet, pitch shift will not work",
            e,
          );
        },
      );
  }

  pitchShift(semitones: number) {
    if (this.vocoderNode) {
      // @ts-expect-error i swear there's a .get method on this object.
      this.vocoderNode.parameters.get("pitchFactor").value = Math.pow(
        2,
        semitones / 12,
      );
    }
  }

  gain(gain: number) {
    this.gainNode.gain.value = gain;
  }

  sink(): AudioNode {
    return this.vocoderNode || this.gainNode;
  }
}
