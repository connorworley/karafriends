declare global {
  interface Window {
    karafriends: {
      isLoggedIn(): Promise<boolean>;
      attemptLogin(creds: { account: string; password: string }): void;
      nativeAudio: {
        inputDevices: () => string[];
        outputDevices: () => string[];
        inputDevice_new: (name: string) => number;
        inputDevice_delete: (deviceId: number) => void;
        inputDevice_getPitch: (
          deviceId: number
        ) => { midiNumber: number; confidence: number };
      };
    };
  }
}

export {};
