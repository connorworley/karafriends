declare global {
  interface Window {
    karafriends: {
      isLoggedIn(): Promise<boolean>;
      attemptLogin(creds: { account: string; password: string }): void;
      ipAddresses(): string[];
      nativeAudio: {
        inputDevices: () => [string, number][];
        outputDevices: () => string[];
        inputDevice_new: (name: string, isAsio: boolean) => number;
        inputDevice_delete: (deviceId: number) => void;
        inputDevice_getPitch: (
          deviceId: number,
          left: boolean
        ) => { midiNumber: number; confidence: number };
        inputDevice_stop: (deviceId: number) => void;
      };
    };
  }

  class FinalizationRegistry<T> {
    constructor(callback: (heldValue: T) => void);
    register(target: object, heldValue: T): void;
  }
}

export {};
