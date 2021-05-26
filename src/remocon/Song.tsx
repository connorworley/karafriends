import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { RouteComponentProps } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import QueueButton from "./components/QueueButton";
import { SongQuery } from "./__generated__/SongQuery.graphql";

const songQuery = graphql`
  query SongQuery($id: String!) {
    songById(id: $id) {
      name
      nameYomi
      artistName
      artistNameYomi
      lyricsPreview
      vocalTypes
      tieUp
      playtime
    }
  }
`;

interface SongParams {
  id: string;
}

interface Props extends RouteComponentProps<SongParams> {}

function Song(props: Props) {
  const { id } = props.match.params;
  const data = useLazyLoadQuery<SongQuery>(songQuery, { id });
  const song = data.songById;
  return (
    <div className="card">
      <div className="card-content">
        <h6>{song.artistName}</h6>
        <h5>{song.name}</h5>
        {!!song.tieUp && (
          <p className="grey-text text-lighten-1">{song.tieUp}</p>
        )}
        {!!song.lyricsPreview && (
          <blockquote>{song.lyricsPreview} ...</blockquote>
        )}
      </div>
      <div className="card-action">
        {song.vocalTypes.map((vocalType, i) => {
          let defaultText = "";
          switch (vocalType) {
            case "NORMAL":
              defaultText = "Queue song";
              break;
            case "GUIDE_MALE":
              defaultText = "Queue song - guide vocal (male)";
              break;
            case "GUIDE_FEMALE":
              defaultText = "Queue song - guide vocal (female)";
              break;
            default:
              throw new Error(`unknown vocal type ${vocalType}`);
          }
          return (
            <span key={vocalType}>
              <QueueButton
                defaultText={defaultText}
                variables={{
                  song: {
                    id,
                    name: song.name,
                    artistName: song.artistName,
                    playtime: song.playtime,
                  },
                  streamingUrlIdx: i,
                }}
              />{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default withLoader(Song);
