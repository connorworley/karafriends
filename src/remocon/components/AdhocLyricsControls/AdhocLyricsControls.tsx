import React, { useRef, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { useNavigate } from "react-router-dom";
import invariant from "ts-invariant";

import useNowPlaying from "../../hooks/useNowPlaying";
import useUserIdentity from "../../hooks/useUserIdentity";
import { isYouTubeVideoWithLyricsPlaying } from "../../pages/YouTubePage";

import { withLoader } from "../Loader";
import * as styles from "./AdhocLyricsControls.module.scss";
import LyricsController from "./LyricsController";
import LyricsPicker from "./LyricsPicker";
import { AdhocLyricsControlsLyricsQuery } from "./__generated__/AdhocLyricsControlsLyricsQuery.graphql";
import { AdhocLyricsControlsPushLyricsMutation } from "./__generated__/AdhocLyricsControlsPushLyricsMutation.graphql";

const adhocLyricsControlsLyricsQuery = graphql`
  query AdhocLyricsControlsLyricsQuery($id: String!) {
    adhocLyrics(id: $id)
  }
`;

const adhocLyricsControlsPushLyricsMutation = graphql`
  mutation AdhocLyricsControlsPushLyricsMutation(
    $lyric: String!
    $lyricIndex: Int!
  ) {
    pushAdhocLyrics(input: { lyric: $lyric, lyricIndex: $lyricIndex })
  }
`;

type Props = {
  id: string;
};

function AdhocLyricsControls({ id }: Props) {
  const navigate = useNavigate();
  const { nickname } = useUserIdentity();
  const currentSong = useNowPlaying();

  const [selectedIndex, _setSelectedIndex] = useState<number>(0);
  const indexRef = useRef(selectedIndex);
  const setSelectedIndex = (index: number) => {
    indexRef.current = index;
    _setSelectedIndex(index);
  };

  const { adhocLyrics } = useLazyLoadQuery<AdhocLyricsControlsLyricsQuery>(
    adhocLyricsControlsLyricsQuery,
    { id }
  );
  const [pushLyrics] = useMutation<AdhocLyricsControlsPushLyricsMutation>(
    adhocLyricsControlsPushLyricsMutation
  );

  if (
    !adhocLyrics?.length ||
    (currentSong !== undefined &&
      !isYouTubeVideoWithLyricsPlaying(currentSong, id, nickname))
  ) {
    navigate("/");

    return (
      <div className={styles.noLyrics}>
        Cannot find lyrics for the song with ID: {id}
      </div>
    );
  }

  const onSendLine = () => {
    const index = indexRef.current;
    pushLyrics({
      variables: {
        lyric: adhocLyrics[index],
        lyricIndex: index,
      },
    });
    setSelectedIndex(index + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.picker}>
        <LyricsPicker
          lyrics={adhocLyrics}
          selectedIndex={selectedIndex}
          onSelectLine={setSelectedIndex}
        />
      </div>
      <LyricsController onSendLine={onSendLine} />
    </div>
  );
}

export default withLoader(AdhocLyricsControls);
