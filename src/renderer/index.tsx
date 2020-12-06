import path from "path";

import isDev from "electron-is-dev";
import express from "express";
import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

const app = express();
if (isDev) {
  // On dev, we should proxy non-graphql requests to the remocon dev server
  app.use((req, res, next) => {
    if (req.path === "graphql") {
      next();
      return;
    }
    fetch(`http://localhost:3000/remocon${req.originalUrl}`, {
      method: req.method,
    }).then((proxiedRes) => {
      res.status(proxiedRes.status);
      for (const header of proxiedRes.headers) {
        res.append(...header);
      }
      proxiedRes.arrayBuffer().then((buf) => {
        res.send(Buffer.from(buf));
      });
    });
  });
} else {
  // On prod, we can just serve up the built remocon bundle
  app.use(express.static(path.join(__dirname, "..", "remocon")));
}
app.listen(8080);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
