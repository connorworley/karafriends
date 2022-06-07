import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import HomePage from "./pages/HomePage";

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/" component={HomePage} />
    </Switch>
  </HashRouter>
);

export default App;
