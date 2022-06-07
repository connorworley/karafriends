import React from "react";
import ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay";

import environment from "../common/graphqlEnvironment";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
