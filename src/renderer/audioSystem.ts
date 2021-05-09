// @ts-ignore: typescript doesn't into FinalizationRegistry yet
const registry = new FinalizationRegistry(
  window.karafriends.nativeAudio.inputDevice_delete
);

export class InputDevice {
  deviceId: number;

  constructor(name: string) {
    this.deviceId = window.karafriends.nativeAudio.inputDevice_new(name);
    registry.register(this, this.deviceId);
  }

  getPitch() {
    return window.karafriends.nativeAudio.inputDevice_getPitch(this.deviceId);
  }
}
