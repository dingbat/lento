import ohm from "ohm-js";
import raw from "raw.macro";
const contents = raw("./grammar.ohm");

const grammar = ohm.grammar(contents);

export interface Ast {
  settings: Setting[];
  sections: Section[];
}

interface Setting {
  type: "set";
  param: "bpm" | "key";
  value: string | number;
}

type Section = InstrumentSection | ArrangementSection;
type Track = string;

interface InstrumentSection {
  name: string;
  type: "instrument";
  instrument: string;
  tracks: Track[];
}

interface ArrangementSection {
  name: string;
  type: "arrangement";
  commands: Command[];
}

type Command = PlayCommand | LoopCommand;

interface PlayCommand {
  type: "play";
  times: number;
  source: Source;
}

interface LoopCommand {
  type: "loop";
  source: Source;
}

type Source = { reversed: boolean } & (InlineTrackSource | SectionSource);

interface InlineTrackSource {
  type: "inline_track";
  instrument: string;
  track: Track;
}

interface SectionSource {
  type: "section";
  name: string;
}

const semantics = grammar.createSemantics().addOperation("ast", {
  Composition(_1, { children }): Ast {
    const statements = children.map((x) => x.ast());
    return {
      settings: statements.filter((x) => x.type === "set"),
      sections: statements.filter(
        (x) => x.type === "instrument" || x.type === "arrangement"
      ),
    };
  },
  Instrument(header, trackList): InstrumentSection {
    const { instrument, name } = header.ast();
    return {
      type: "instrument",
      instrument,
      name,
      tracks: trackList.ast().flat(Infinity),
    };
  },
  TrackList(track, _1, trackList) {
    return [
      track.ast(),
      ...(trackList.sourceString.length ? trackList.ast() : []),
    ];
  },
  track(_bar, track, _bar2): Track {
    return track.sourceString;
  },
  instrumentHeader(_1, name, _slash, instrument, _2, _3) {
    return { name: name.sourceString, instrument: instrument.sourceString };
  },
  Statement(setOrSection, _) {
    return setOrSection.ast();
  },
  set(_set, _1, param, _2, _to, _3, value): Setting {
    if (param.sourceString !== "bpm" && param.sourceString !== "key") {
      throw new Error("bpm or key expected");
    }
    return {
      type: "set",
      param: param.sourceString,
      value: value.sourceString,
    };
  },

  Arrangement(header, commandList): ArrangementSection {
    const { name } = header.ast();
    return {
      type: "arrangement",
      name,
      commands: commandList.ast().flat(Infinity),
    };
  },
  arrangementHeader(_1, name, _slash, _2) {
    return { name: name.sourceString };
  },
  CommandList(command, _1, commandList) {
    return [
      command.ast(),
      ...(commandList.sourceString ? commandList.ast() : []),
    ];
  },
  Play(_play, fragment, times, _times) {
    return {
      type: "play",
      times: times.sourceString ? parseInt(times.sourceString) : 1,
      source: fragment.ast(),
    };
  },
  Loop(_loop, fragment) {
    return {
      type: "loop",
      source: fragment.ast(),
    };
  },
  Fragment(reversed, ident, track): Source {
    if (track.sourceString) {
      return {
        type: "inline_track",
        instrument: ident.sourceString,
        track: track.ast()[0],
        reversed: !!reversed.sourceString,
      };
    } else {
      return {
        type: "section",
        name: ident.sourceString,
        reversed: !!reversed.sourceString,
      };
    }
  },
});

function parse(composition: string): Ast | null {
  let match;
  try {
    match = grammar.match(composition);
  } catch (e) {
    return null;
  }
  if (match.succeeded()) {
    return semantics(match).ast();
  } else {
    // console.log(grammar.trace(composition).toString());
    return null;
  }
}
export default parse;
