import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import ControlBar from "./components/ControlBar";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";

import styles from './App.module.scss';

const App = () => (
  <HashRouter>
    <div className={styles.app}>
      <header>
        <NavBar />
      </header>
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
        </Switch>
      </main>
      <footer>
        <ControlBar />
      </footer>
    </div>
  </HashRouter>
);

export default App;
