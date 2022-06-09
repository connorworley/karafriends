import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import ControlBar from "./components/ControlBar";
import NavBar from "./components/NavBar";
import ArtistPage from "./pages/ArtistPage";
import ArtistSearchPage from "./pages/ArtistSearchPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import SongPage from "./pages/SongPage";
import SongSearchPage from "./pages/SongSearchPage";

import styles from "./App.module.scss";

const App = () => (
  <HashRouter>
    <div className={styles.app}>
      <header>
        <NavBar />
      </header>
      <main>
        <Switch>
          <Route path="/song/:id" component={SongPage} />
          <Route path="/artist/:id" component={ArtistPage} />
          <Route path="/search/song/:query?" component={SongSearchPage} />
          <Route path="/search/artist/:query?" component={ArtistSearchPage} />
          <Route path="/history" component={HistoryPage} />
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
