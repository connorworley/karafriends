import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://80cbda8ca4af42d9b95c60eb1f00566f@sentry.io/6728669",
  debug: true,
});

import inspector from "inspector";

inspector.open();

import path from "path";

import compression from "compression";
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
import { memoize } from "lodash";

import karafriendsConfig from "../common/config";
import { TEMP_FOLDER } from "./../common/videoDownloader";
import { MinseiAPI } from "./damApi";
import { applyGraphQLMiddleware } from "./graphql";
import { JoysoundAPI } from "./joysoundApi";
import setupMdns from "./mdns";
import remoconReverseProxy from "./middleware/remoconReverseProxy";
import remoconServiceWorkerAllowed from "./middleware/remoconServiceWorkerAllowed";

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

async function minseiCredentialsProvider() {
  const { damUsername, damPassword } = karafriendsConfig;
  const minseiLoginResult = await MinseiAPI.login(damUsername, damPassword);
  return {
    userCode: damUsername,
    authToken: minseiLoginResult.data.authToken,
  };
}

async function joysoundCredentialsProvider() {
  const joysoundEmail = encodeURIComponent(karafriendsConfig.joysoundEmail);
  const joysoundPassword = encodeURIComponent(
    karafriendsConfig.joysoundPassword,
  );
  return JoysoundAPI.login(joysoundEmail, joysoundPassword);
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
      `http://localhost:${karafriendsConfig.remoconPort}/*`, // TODO: Set CORS headers on the Express side and remove this
    ],
  };

  session.webRequest.onBeforeSendHeaders(
    ignoreCORSFilter,
    (details, callback) => {
      delete details.requestHeaders.Origin;
      callback({ requestHeaders: details.requestHeaders });
    },
  );

  session.webRequest.onHeadersReceived(
    ignoreCORSFilter,
    (details, callback) => {
      // Chrome is not happy if ACAO is set twice, which is what happens
      // when the Express static middleware is setting this one
      delete details.responseHeaders!["access-control-allow-origin"];
      details.responseHeaders!["Access-Control-Allow-Origin"] = ["*"];
      callback({ responseHeaders: details.responseHeaders });
    },
  );

  if (karafriendsConfig.proxyEnable) {
    session.setProxy({
      proxyRules: karafriendsConfig.proxyURL,
      proxyBypassRules: "<local>,192.168.0.0/16,172.16.0.0/12,10.0.0.0/8",
    });
    // Technically should await this promise
  }

  protocol.registerFileProtocol("karafriends", (request, callback) => {
    console.log(`Got protocol request: ${request.method} ${request.url}`);
    const url = request.url.substr(14 /* 'karafriends://'.length */);
    callback({ path: path.normalize(`${TEMP_FOLDER}/${url}`) });
  });

  const expressApp = express();

  expressApp.use(compression());

  applyGraphQLMiddleware(
    expressApp,
    memoize(minseiCredentialsProvider),
    memoize(joysoundCredentialsProvider),
  );

  expressApp.use(remoconServiceWorkerAllowed());

  // This middleware terminates the request/response cycle and should be applied last
  expressApp.use(remoconReverseProxy(karafriendsConfig.devPort));

  if (rendererWindow)
    rendererWindow.loadURL(
      isDev
        ? `http://localhost:${karafriendsConfig.devPort}/renderer/`
        : `file://${path.join(__dirname, "..", "renderer", "index.html")}`,
    );

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

app.on("login", (event, webContents, request, authInfo, callback) => {
  console.log(
    `login event received: authinfo=${authInfo} callback=${callback}`,
  );
  if (karafriendsConfig.proxyEnable) {
    const { proxyURL, proxyUser, proxyPass } = karafriendsConfig;
    console.log(`Time to login to ${proxyURL}`);
    callback(proxyUser, proxyPass);
    process.env.http_proxy = `http://${proxyUser}:${proxyPass}@${proxyURL}`;
    event.preventDefault();
  } else {
    // Well that's strange...
    console.log("Received login event even though proxy is not enabled?");
    if (rendererWindow) {
      dialog.showMessageBoxSync(rendererWindow, {
        message:
          "Received login event even though proxy is not enabled. Proceed with caution",
      });
    }
  }
});
