import React, { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import ControlBar from "./components/ControlBar";
import NavBar from "./components/NavBar";
import useNickname from "./hooks/useNickname";
import AdhocLyricsPage from "./pages/AdhocLyricsPage";
import ArtistPage from "./pages/ArtistPage";
import ArtistSearchPage from "./pages/ArtistSearchPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import JoysoundArtistPage from "./pages/JoysoundArtistPage";
import JoysoundArtistSearchPage from "./pages/JoysoundArtistSearchPage";
import JoysoundSongPage from "./pages/JoysoundSongPage";
import JoysoundSongSearchPage from "./pages/JoysoundSongSearchPage";
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
          <Routes>
            <Route path="/song/:id" element={<SongPage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/adhocLyrics/:id" element={<AdhocLyricsPage />} />
            <Route path="/joysoundSong/:id" element={<JoysoundSongPage />} />
            <Route
              path="/joysoundSong/:id/:youtubeVideoId"
              element={<JoysoundSongPage />}
            />
            <Route
              path="/joysoundArtist/:id"
              element={<JoysoundArtistPage />}
            />
            <Route path="/search/song/:query?" element={<SongSearchPage />} />
            <Route
              path="/search/artist/:query?"
              element={<ArtistSearchPage />}
            />
            <Route path="/search/youtube/:videoId?" element={<YouTubePage />} />
            <Route
              path="/search/niconico/:videoId?"
              element={<NiconicoPage />}
            />
            <Route
              path="/search/joysoundSong/:query?"
              element={<JoysoundSongSearchPage />}
            />
            <Route
              path="/search/joysoundArtist/:query?"
              element={<JoysoundArtistSearchPage />}
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
        <footer>
          <ControlBar />
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
