import React, { useEffect } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import ControlBar from "./components/ControlBar";
import NavBar from "./components/NavBar";
import useNickname from "./hooks/useNickname";
import AdhocLyricsPage from "./pages/AdhocLyricsPage";
import ArtistPage from "./pages/ArtistPage";
import ArtistSearchPage from "./pages/ArtistSearchPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import NiconicoPage from "./pages/NiconicoPage";
import SongPage from "./pages/SongPage";
import SongSearchPage from "./pages/SongSearchPage";
import YouTubePage from "./pages/YouTubePage";

import styles from "./App.module.scss";

const App = () => {
  useNickname(true);

  return (
    <HashRouter>
      <div className={styles.app}>
        <header>
          <NavBar />
        </header>
        <main>
          <Switch>
            <Route path="/song/:id" component={SongPage} />
            <Route path="/artist/:id" component={ArtistPage} />
            <Route path="/adhocLyrics/:id" component={AdhocLyricsPage} />
            <Route path="/search/song/:query?" component={SongSearchPage} />
            <Route path="/search/artist/:query?" component={ArtistSearchPage} />
            <Route path="/search/youtube/:videoId?" component={YouTubePage} />
            <Route path="/search/niconico/:videoId?" component={NiconicoPage} />
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
};

export default App;
