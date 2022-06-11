import React from "react";
import Picker from "react-mobile-picker-scroll";

interface Props {
  lyrics: readonly string[];
  selectedIndex: number;
  onSelectLine: (line: number) => void;
}

const LyricsPicker = ({ lyrics, selectedIndex, onSelectLine }: Props) => {
  const formattedLyrics = lyrics.map((line, i) => `${i} | ${line}`);
  return (
    <Picker
      optionGroups={{ lyrics: formattedLyrics }}
      valueGroups={{ lyrics: formattedLyrics[selectedIndex] }}
      onChange={(_: string, line: string) =>
        onSelectLine(parseInt(line.split(" | ", 1)[0], 10))
      }
    />
  );
};

export default LyricsPicker;
