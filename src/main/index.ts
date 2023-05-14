import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://80cbda8ca4af42d9b95c60eb1f00566f@sentry.io/6728669",
  debug: true,
});

import inspector from "inspector";

inspector.open();

import path from "path";

import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  IpcMainEvent,
  protocol,
} from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import karafriendsConfig from "../common/config";
import { TEMP_FOLDER } from "./../common/videoDownloader";
import { MinseiAPI, MinseiCredentials } from "./damApi";
import { applyGraphQLMiddleware } from "./graphql";
import { JoysoundAPI } from "./joysoundApi";
import setupMdns from "./mdns";
import remoconMiddleware from "./remoconMiddleware";

const nativeAudio = require("../../native"); // tslint:disable-line:no-var-requires

try {
  nativeAudio.allocConsole();
} catch (e) {
  console.error(e);
}

setupMdns();

protocol.registerSchemesAsPrivileged([
  {
    scheme: "karafriends",
    privileges: {
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

async function attemptLogin() {
  const damUsername = karafriendsConfig.damUsername;
  const damPassword = karafriendsConfig.damPassword;
  const joysoundEmail = encodeURIComponent(karafriendsConfig.joysoundEmail);
  const joysoundPassword = encodeURIComponent(
    karafriendsConfig.joysoundPassword
  );

  return Promise.all([
    MinseiAPI.login(damUsername, damPassword),
    JoysoundAPI.login(joysoundEmail, joysoundPassword),
  ])
    .then((values) => ({
      minseiUserCode: damUsername,
      minseiAuthToken: values[0].data.authToken,
      joysoundCreds: values[1],
    }))
    .catch((e) =>
      Promise.reject(`credentials were invalid (${e})\n\n${e.stack}`)
    )
    .then((creds) => {
      const minseiCreds: MinseiCredentials = {
        userCode: creds.minseiUserCode,
        authToken: creds.minseiAuthToken,
      };

      const expressApp = express();
      expressApp.use(remoconMiddleware());

      applyGraphQLMiddleware(expressApp, minseiCreds, creds.joysoundCreds);
    });
}

let rendererWindow: BrowserWindow | null;

function createWindow() {
  rendererWindow = new BrowserWindow({
    frame: isDev,
    fullscreen: !isDev,
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, "..", "preload", "main.js"),
      sandbox: false,
      webSecurity: true,
    },
  });

  // Ignore CORS when fetching ipcasting HLS and when sending requests to remocon
  const session = rendererWindow.webContents.session;
  const ignoreCORSFilter = {
    urls: [
      "https://*.ipcasting.jp/*",
      `http://localhost:${karafriendsConfig.remoconPort}/*`,
    ],
  };

  session.webRequest.onBeforeSendHeaders(
    ignoreCORSFilter,
    (details, callback) => {
      delete details.requestHeaders.Origin;
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  session.webRequest.onHeadersReceived(
    ignoreCORSFilter,
    (details, callback) => {
      // Chrome is not happy if ACAO is set twice, which is what happens
      // when the Express static middleware is setting this one
      delete details.responseHeaders!["access-control-allow-origin"];
      details.responseHeaders!["Access-Control-Allow-Origin"] = ["*"];
      callback({ responseHeaders: details.responseHeaders });
    }
  );

  protocol.registerFileProtocol("karafriends", (request, callback) => {
    console.log(`Got protocol request: ${request.method} ${request.url}`);
    const url = request.url.substr(14 /* 'karafriends://'.length */);
    callback({ path: path.normalize(`${TEMP_FOLDER}/${url}`) });
  });

  attemptLogin()
    .catch((e) => dialog.showErrorBox("Error logging in", e.toString()))
    .then(() => {
      if (rendererWindow)
        rendererWindow.loadURL(
          isDev
            ? "http://localhost:3000/renderer/"
            : `file://${path.join(__dirname, "..", "renderer", "index.html")}`
        );
    });
  rendererWindow.on("closed", () => (rendererWindow = null));

  ipcMain.on("config", (event: IpcMainEvent) => {
    console.log("Sending config over ipc");
    event.returnValue = karafriendsConfig;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (rendererWindow === null) {
    createWindow();
  }
});

function refreshRendererWindow() {
  if (!rendererWindow) return;
  if (
    dialog.showMessageBoxSync(rendererWindow, {
      message: "Are you sure you want to reload the renderer window?",
      buttons: ["Reload", "Cancel"],
    }) === 0
  ) {
    rendererWindow.reload();
  }
}

app.on("browser-window-focus", () => {
  globalShortcut.register("CommandOrControl+R", refreshRendererWindow);
  globalShortcut.register("F5", refreshRendererWindow);
});

app.on("browser-window-blur", () => {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregister("F5");
});
