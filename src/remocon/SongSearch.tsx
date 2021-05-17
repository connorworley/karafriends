import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { Link, RouteComponentProps } from "react-router-dom";
import { bind, unbind, isRomaji, toKana, toRomaji } from "wanakana";

import Loader from "../common/components/Loader";
import environment from "../common/graphqlEnvironment";
import DebouncedInput from "./components/DebouncedInput";
import { SongSearchQuery } from "./__generated__/SongSearchQuery.graphql";

enum ImeBinding {
  Unknown,
  Bound,
  Unbound,
}

interface SongSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<SongSearchParams> {}

function SongSearch(outerProps: Props) {
  const [songName, setSongName] = useState<string | null>(
    outerProps.match.params.query || null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  console.log(history.state);
  const [imeBound, setImeBound] = useState(
    history.state.imeBound || ImeBinding.Unknown
  );

  function doSearch(query: string) {
    setSongName(query === "" ? null : query);
    history.replaceState(
      {
        imeBound: imeBound === ImeBinding.Bound ? imeBound : ImeBinding.Unknown,
      },
      "",
      `#/search/song/${query}`
    );
  }

  useEffect(() => {
    if (!inputRef.current) return;
    if (imeBound === ImeBinding.Bound) {
      bind(inputRef.current);
      inputRef.current.value = toKana(inputRef.current.value);
    } else if (imeBound === ImeBinding.Unbound) {
      unbind(inputRef.current);
      inputRef.current.value = toRomaji(inputRef.current.value);
    } else {
      return;
    }
    doSearch(inputRef.current.value);
  }, [imeBound]);

  return (
    <div>
      <h5>Searching by song title</h5>
      <div style={{ display: "flex" }}>
        <DebouncedInput
          inputRef={inputRef}
          period={500}
          onChange={(e) => doSearch(e.target.value)}
          defaultValue={outerProps.match.params.query}
        />
        <a
          className={`btn-floating btn-large waves-effect waves-light ${
            imeBound === ImeBinding.Bound ? "green" : "grey"
          }`}
          onClick={() =>
            setImeBound(
              imeBound === ImeBinding.Bound
                ? ImeBinding.Unbound
                : ImeBinding.Bound
            )
          }
        >
          {imeBound === ImeBinding.Bound ? "あ" : "A"}
        </a>
      </div>
      <QueryRenderer<SongSearchQuery>
        environment={environment}
        query={graphql`
          query SongSearchQuery($name: String) {
            songsByName(name: $name) {
              id
              name
              nameYomi
              artistName
              artistNameYomi
            }
          }
        `}
        variables={{
          name: songName,
        }}
        render={({ error, props }) => {
          if (songName === null) {
            return;
          }
          if (!props) {
            return <Loader />;
          }
          return (
            <div className="collection">
              {props.songsByName.map((song) => (
                <Link
                  to={`/song/${song.id}`}
                  className="collection-item"
                  key={song.id}
                >
                  {song.name}{" "}
                  {isRomaji(song.name) ? null : (
                    <span className="grey-text text-lighten-2">
                      {toRomaji(song.nameYomi)}
                    </span>
                  )}
                  <br />
                  {song.artistName}{" "}
                  {isRomaji(song.artistName) ? null : (
                    <span className="grey-text text-lighten-2">
                      {toRomaji(song.artistNameYomi)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}
export default SongSearch;
