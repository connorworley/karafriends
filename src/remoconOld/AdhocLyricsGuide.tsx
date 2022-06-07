import React, { KeyboardEvent, useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { CgTapSingle } from "react-icons/cg";
// tslint:disable-next-line:no-submodule-imports
import { GiSideswipe } from "react-icons/gi";
// @ts-ignore minor package doesn't have any typing made for it and adding typing for it is too much effort
import Picker from "react-mobile-picker-scroll";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { RouteComponentProps } from "react-router-dom";
import { SwipeEventData, useSwipeable } from "react-swipeable";
import invariant from "ts-invariant";
import { withLoader } from "../common/components/Loader";
import { AdhocLyricsGuideLyricsQuery } from "./__generated__/AdhocLyricsGuideLyricsQuery.graphql";
import { AdhocLyricsGuidePopLyricsMutation } from "./__generated__/AdhocLyricsGuidePopLyricsMutation.graphql";
import { AdhocLyricsGuidePushLyricsMutation } from "./__generated__/AdhocLyricsGuidePushLyricsMutation.graphql";

import "./AdhocLyricsGuide.css";

const adhocLyricsGuideLyricsQuery = graphql`
  query AdhocLyricsGuideLyricsQuery($id: String!) {
    adhocLyrics(id: $id)
  }
`;

const adhocLyricsGuidePushLyricsMutation = graphql`
  mutation AdhocLyricsGuidePushLyricsMutation(
    $lyric: String!
    $lyricIndex: Int!
  ) {
    pushAdhocLyrics(input: { lyric: $lyric, lyricIndex: $lyricIndex })
  }
`;

const adhocLyricsGuidePopLyricsMutation = graphql`
  mutation AdhocLyricsGuidePopLyricsMutation {
    popAdhocLyrics
  }
`;

type RouteParams = {
  id: string;
};

interface RoutedAdhocLyricsGuideProps
  extends RouteComponentProps<RouteParams> {}

function AdhocLyricsGuide(props: RoutedAdhocLyricsGuideProps) {
  const { id } = props.match.params;
  const adhocLyrics = useLazyLoadQuery<AdhocLyricsGuideLyricsQuery>(
    adhocLyricsGuideLyricsQuery,
    { id }
  );
  const [selectedLyricIndex, setSelectedLyricIndex] = useState<number>(0);
  const [pushLyrics] = useMutation<AdhocLyricsGuidePushLyricsMutation>(
    adhocLyricsGuidePushLyricsMutation
  );
  const [popLyrics] = useMutation<AdhocLyricsGuidePopLyricsMutation>(
    adhocLyricsGuidePopLyricsMutation
  );

  function onTapLyricsController() {
    invariant(adhocLyrics?.adhocLyrics);
    pushLyrics({
      variables: {
        lyric: adhocLyrics.adhocLyrics[selectedLyricIndex],
        lyricIndex: selectedLyricIndex,
      },
    });
    setSelectedLyricIndex(selectedLyricIndex + 1);
  }

  function onSwipeLyricsController() {
    popLyrics({ variables: {} });
  }

  function handleOnKeyDown(event: KeyboardEvent<HTMLImageElement>) {
    console.log(event);
    if (event.key === "z") {
      onTapLyricsController();
    } else if (event.key === "x") {
      onSwipeLyricsController();
    }
  }

  const lyricsControllerHandlers = useSwipeable({
    onTap: onTapLyricsController,
    onSwiped: onSwipeLyricsController,
  });

  function onSelectedLyricChange(_: string, value: string) {
    setSelectedLyricIndex(parseInt(value.split("| ", 1)[0], 10));
  }

  function handleAdhocLyricsFallback() {
    if (
      adhocLyrics?.adhocLyrics === null ||
      adhocLyrics?.adhocLyrics === undefined ||
      adhocLyrics?.adhocLyrics.length === 0
    ) {
      return (
        <div className="card no-lyrics-container">
          <h2>Can't find any lyrics for the song with the id {id}</h2>
        </div>
      );
    }

    const formattedLyrics: string[] = adhocLyrics.adhocLyrics.map(
      (adhocLyric, idx) => `${idx}| ${adhocLyric}`
    );

    return (
      <div onKeyDown={handleOnKeyDown} tabIndex={0}>
        <div className="lyrics-controller-container">
          <div className="lyrics-controller" {...lyricsControllerHandlers}>
            <div>
              Tap <CgTapSingle /> or press "z" to send selected lyric line
              <br />
              Swipe <GiSideswipe /> or press "x" to remove oldest lyric line
            </div>
          </div>
        </div>
        <LyricsSelector
          lyrics={formattedLyrics}
          selectedLyricIndex={selectedLyricIndex}
          onSelectedLyricChange={onSelectedLyricChange}
        />
      </div>
    );
  }

  return <>{handleAdhocLyricsFallback()}</>;
}

type LyricsSelectorProps = {
  lyrics: string[];
  selectedLyricIndex: number;
  onSelectedLyricChange: (_: string, value: string) => void;
};
function LyricsSelector(props: LyricsSelectorProps) {
  return (
    <>
      <Picker
        optionGroups={{ lyrics: props.lyrics }}
        valueGroups={{ lyrics: props.lyrics[props.selectedLyricIndex] }}
        onChange={props.onSelectedLyricChange}
      />
    </>
  );
}

export default withLoader(AdhocLyricsGuide);
