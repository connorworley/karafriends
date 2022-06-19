import React, { useRef, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import invariant from "ts-invariant";

import { withLoader } from "../Loader";
import styles from "./AdhocLyricsControls.module.scss";
import LyricsController from "./LyricsController";
import LyricsPicker from "./LyricsPicker";
import { AdhocLyricsControlsLyricsQuery } from "./__generated__/AdhocLyricsControlsLyricsQuery.graphql";
import { AdhocLyricsControlsPopLyricsMutation } from "./__generated__/AdhocLyricsControlsPopLyricsMutation.graphql";
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

const adhocLyricsControlsPopLyricsMutation = graphql`
  mutation AdhocLyricsControlsPopLyricsMutation {
    popAdhocLyrics
  }
`;

type Props = {
  id: string;
};

function AdhocLyricsControls({ id }: Props) {
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
  const [popLyrics] = useMutation<AdhocLyricsControlsPopLyricsMutation>(
    adhocLyricsControlsPopLyricsMutation
  );

  if (!adhocLyrics?.length) {
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

  const onRemoveLine = () => {
    popLyrics({ variables: {} });
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
      <LyricsController onSendLine={onSendLine} onRemoveLine={onRemoveLine} />
    </div>
  );
}

export default withLoader(AdhocLyricsControls);
