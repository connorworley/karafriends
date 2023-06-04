import React, { useEffect, useRef, useState } from "react";
import { graphql, requestSubscription } from "react-relay";
import invariant from "ts-invariant";

import FadeIn from "react-fade-in";
import { withLoader } from "../common/components/Loader";
import environment from "../common/graphqlEnvironment";
import { AdhocLyricsCurrentLyricsSubscription$data } from "./__generated__/AdhocLyricsCurrentLyricsSubscription.graphql";

import "./AdhocLyrics.css";

const adhocLyricsCurrentLyricsSubscription = graphql`
  subscription AdhocLyricsCurrentLyricsSubscription {
    currentSongAdhocLyricsChanged {
      lyric
      lyricIndex
    }
  }
`;

type LyricEntry = {
  lyric: string;
  lyricIndex: number;
  displayIndex: number;
  marginTop: number;
  isNewLyricLine: boolean;
};

function AdhocLyrics() {
  const [lyricLines, setLyricLines] = useState<LyricEntry[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleNewLyrics(
    response: AdhocLyricsCurrentLyricsSubscription$data
  ) {
    setLyricLines((prevLyricLines) => {
      const newLyricsLineCount = response.currentSongAdhocLyricsChanged.length;
      const newLyricIndices = response.currentSongAdhocLyricsChanged.map(
        (lyricEntry) => lyricEntry.lyricIndex
      );
      const currentLyricIndices = prevLyricLines.map(
        (lyricEntry) => lyricEntry.lyricIndex
      );
      const freshLyricIndices = newLyricIndices.filter(
        (lyricIndex) => !currentLyricIndices.includes(lyricIndex)
      );
      const newLyricEntry: LyricEntry[] =
        response.currentSongAdhocLyricsChanged.map((lyricEntry, index) => {
          const height = getTextHeight(
            lyricEntry.lyric,
            // This must match the width specified in AdhocLyrics.css
            "4vw sans-serif"
          );

          return {
            lyric: lyricEntry.lyric,
            lyricIndex: lyricEntry.lyricIndex,
            displayIndex: index,
            // marginTop for positioning each line
            marginTop: -1 * (newLyricsLineCount - index) * height * 3.4,
            isNewLyricLine: freshLyricIndices.includes(lyricEntry.lyricIndex),
          };
        });
      return newLyricEntry;
    });
  }

  function getTextHeight(text: string, font: string): number {
    const canvas = canvasRef.current;
    invariant(canvas);

    const context = canvas.getContext("2d");
    invariant(context);

    context.font = font;
    const metrics = context.measureText(text);

    // @ts-ignore fontBoundingBoxAscent etc. isn't supported by a lot of browsers so it's not typed, but it does work in chromium (i.e. electron)
    return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  }

  useEffect(() => {
    const adhocLyricsSubscription = requestSubscription(environment, {
      subscription: adhocLyricsCurrentLyricsSubscription,
      variables: {},
      // @ts-ignore: @types/react-relay has unknown return type for onNext response
      onNext: handleNewLyrics,
    });

    return () => {
      adhocLyricsSubscription.dispose();
    };
  }, []);

  return (
    <>
      <div className="lyrics-container">
        <canvas style={{ width: "100%" }} ref={canvasRef} />
        {lyricLines.map((lyricEntry) => {
          const wrapLyricElement = (wrappedElement: JSX.Element) => (
            <div
              className="entry-container"
              key={lyricEntry.displayIndex}
              style={{
                width: "calc(100% - 128px)",
                textAlign: "center",
                lineHeight: "1.25em",
                marginLeft: "32px",
                marginTop: lyricEntry.marginTop + 64,
              }}
            >
              {wrappedElement}
            </div>
          );
          let lyricElement: JSX.Element;
          if (lyricEntry.isNewLyricLine) {
            lyricElement = <FadeIn>{lyricEntry.lyric}</FadeIn>;
            return wrapLyricElement(lyricElement);
          } else {
            lyricElement = <>{lyricEntry.lyric}</>;
            return wrapLyricElement(lyricElement);
          }
        })}
      </div>
    </>
  );
}

export default withLoader(AdhocLyrics);
