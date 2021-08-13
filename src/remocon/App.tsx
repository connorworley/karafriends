import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { HashRouter, Link, Route, Switch } from "react-router-dom";

import M from "materialize-css";
import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports

import Artist from "./Artist";
import Controls from "./Controls";
import History from "./History";
import Search from "./Search";
import Song from "./Song";

function App() {
  useEffect(() => {
    const elems = document.querySelectorAll(".sidenav");
    M.Sidenav.init(elems, {});

    while ((localStorage.getItem("nickname") || "").length === 0) {
      localStorage.setItem(
        "nickname",
        prompt("Please set your nickname:") || ""
      );
    }
  });

  return (
    <HashRouter>
      <div>
        <nav>
          <div className="nav-wrapper">
            <a href="#" data-target="mobile-demo" className="sidenav-trigger">
              <i className="material-icons">menu</i>
            </a>
            <ul id="nav-mobile" className="hide-on-med-and-down">
              <li>
                <Link to="/search">Search Songs</Link>
              </li>
              <li>
                <Link to="/history">History</Link>
              </li>
              <li>
                <Link to="/controls">Controls</Link>
              </li>
            </ul>
          </div>
        </nav>
        <ul className="sidenav" id="mobile-demo">
          <li>
            <Link to="/search">Search Songs</Link>
          </li>
          <li>
            <Link to="/history">History</Link>
          </li>
          <li>
            <Link to="/">Controls</Link>
          </li>
        </ul>

        <div className="container">
          <Switch>
            <Route path="/artist/:id" component={Artist} />
            <Route path="/song/:id" component={Song} />
            <Route path="/search" component={Search} />
            <Route path="/history" component={History} />
            <Route path="/">
              <Controls />
            </Route>
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
