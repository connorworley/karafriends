import path from "path";

import { app, BrowserWindow } from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import remoconMiddleware from "./remoconMiddleware";
import setupGraphQL from "./graphql";

const AudioSystem = require("../../native"); // tslint:disable-line:no-var-requires

class InputDevice {
  boxed: any;

  constructor(name: string) {
    this.boxed = AudioSystem.inputDevice_new(name);
  }
  getPitch() {
    return AudioSystem.inputDevice_getPitch(this.boxed);
  }
}

const inputDevices = AudioSystem.inputDevices();
const mic = new InputDevice(inputDevices[0]);
// TODO: surface sample rate so that we know how often we can get pitch
setInterval(() => console.log(`Pitch: ${mic.getPitch()}`), 100); // tslint:disable-line:no-console

const expressApp = express();
expressApp.use(remoconMiddleware());
setupGraphQL(expressApp);
expressApp.listen(8080);

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: isDev,
    fullscreen: !isDev,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000/renderer/"
      : `file://${path.join(__dirname, "..", "renderer", "index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
