const native = require("../../native"); // tslint:disable-line:no-var-requires

export const inputDevices: () => string[] = native.inputDevices;
export const outputDevices: () => string[] = native.outputDevices;

export class InputDevice {
  boxed: any;

  constructor(name: string) {
    this.boxed = native.inputDevice_new(name);
  }

  getPitch(): { frequency: number; confidence: number } {
    return native.inputDevice_getPitch(this.boxed);
  }
}
