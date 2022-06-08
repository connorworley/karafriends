import React from "react";
import ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay";

import environment from "../common/graphqlEnvironment";
import AppOld from "../remoconOld/App";
import App from "./App";
import "./index.module.scss";

ReactDOM.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
