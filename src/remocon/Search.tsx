import React from "react";
import { Link, Route, RouteComponentProps } from "react-router-dom";

import ArtistSearch from "./ArtistSearch";
import SongSearch from "./SongSearch";

const buttonStyle = {
  height: "auto",
  lineHeight: "normal",
  padding: "16px",
};

const Search = (props: RouteComponentProps) => (
  <>
    <div className="row section">
      <div className="col s6 center-align">
        <Link to="/search/song" className="btn-large" style={buttonStyle}>
          Search by song title
        </Link>
      </div>
      <div className="col s6 center-align">
        <Link to="/search/artist" className="btn-large" style={buttonStyle}>
          Search by artist name
        </Link>
      </div>
    </div>
    <div className="row section">
      <Route path="/search/song/:query?" component={SongSearch} />
      <Route path="/search/artist/:query?" component={ArtistSearch} />
    </div>
  </>
);

export default Search;
