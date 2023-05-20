import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay";

import environment from "../common/graphqlEnvironment";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://80cbda8ca4af42d9b95c60eb1f00566f@sentry.io/6728669",
  debug: true,
});

ReactDOM.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
