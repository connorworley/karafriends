const registry = new FinalizationRegistry(
  window.karafriends.nativeAudio.inputDevice_delete
);

export class InputDevice {
  deviceId: number;
  name: string;

  constructor(name: string, isAsio: boolean) {
    this.deviceId = window.karafriends.nativeAudio.inputDevice_new(
      name,
      isAsio
    );
    this.name = name;
    registry.register(this, this.deviceId);
  }

  getPitch(left: boolean) {
    return window.karafriends.nativeAudio.inputDevice_getPitch(
      this.deviceId,
      left
    );
  }

  stop() {
    return window.karafriends.nativeAudio.inputDevice_stop(this.deviceId);
  }
}
