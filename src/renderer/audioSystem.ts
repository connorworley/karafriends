const registry = new FinalizationRegistry(
  window.karafriends.nativeAudio.inputDevice_delete
);

export class InputDevice {
  deviceId: number;
  name: string;

  constructor(name: string, channelSelection: number) {
    this.deviceId = window.karafriends.nativeAudio.inputDevice_new(
      name,
      channelSelection
    );
    this.name = name;
    registry.register(this, this.deviceId);
  }

  getPitch() {
    return window.karafriends.nativeAudio.inputDevice_getPitch(this.deviceId);
  }

  stop() {
    return window.karafriends.nativeAudio.inputDevice_stop(this.deviceId);
  }
}
