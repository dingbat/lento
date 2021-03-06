import ohm from "ohm-js";
import raw from "raw.macro";
const contents = raw("./grammar.ohm");

const grammar = ohm.grammar(contents);

(function(){})();

export interface Ast {
  settings: Setting[];
  sections: Section[];
}

type Setting = { type: "set" } & (BpmSet | KeySet);

export interface BpmSet {
  param: "bpm";
  value: number;
}

interface KeySet {
  param: "key";
  value: string;
}

export type Section = InstrumentSection | ArrangementSection;
type Track = string;

interface InstrumentSection {
  name: string;
  type: "instrument";
  instrument: string;
  tracks: Track[];
}

export interface ArrangementSection {
  name: string;
  type: "arrangement";
  commands: Command[];
  checked?: boolean;
}

export type Command = PlayCommand | LoopCommand;

export interface PlayCommand {
  type: "play";
  times: number;
  source: Source;
  inlineThen?: Command;
  blockThen?: Command[];
  inMain: boolean;
}

interface LoopCommand {
  type: "loop";
  source: Source;
}

export type Source = { reversed: boolean } & (
  | InlineTrackSource
  | SectionSource
);

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
  Instrument(header, _space, trackList): InstrumentSection {
    const { instrument, name } = header.ast();
    return {
      type: "instrument",
      instrument,
      name,
      tracks: trackList.ast().flat(),
    };
  },
  TrackList(track, _1, tracks) {
    return [track.ast(), ...tracks.ast()];
  },
  track(_bar, track, _bar2): Track {
    return track.sourceString.replaceAll("|", "");
  },
  instrumentHeader(_1, name, _slash, instrument, _2) {
    return { name: name.sourceString, instrument: instrument.sourceString };
  },
  Statement(setOrSection, _) {
    return setOrSection.ast();
  },
  set(_set, _1, param, _2, _to, _3, value): Setting {
    switch (param.sourceString) {
      case "bpm":
        return { type: "set", param: "bpm", value: Number(value.sourceString) };
      case "key":
        return { type: "set", param: "key", value: value.sourceString };
      default:
        throw new Error("bpm or key expected");
    }
  },

  Arrangement(header, _1, commandList): ArrangementSection {
    const { name } = header.ast();
    return {
      type: "arrangement",
      name,
      commands: commandList.ast().flat(),
    };
  },
  CommandList(command, _1, commands) {
    return [command.ast(), ...commands.ast()];
  },
  arrangementHeader(_1, name, _slash2) {
    return { name: name.sourceString };
  },
  Play(_play, fragment, times, inlineThen, _1, blockThen) {
    return {
      type: "play",
      times: times.sourceString ? parseInt(times.sourceString) : 1,
      source: fragment.ast(),
      inlineThen: inlineThen.sourceString ? inlineThen.ast()[0] : undefined,
      blockThen: blockThen.sourceString ? blockThen.ast()[0] : undefined,
    };
  },
  PlayNoBlockThen(_play, fragment, times, inlineThen) {
    return {
      type: "play",
      times: times.sourceString ? parseInt(times.sourceString) : 1,
      source: fragment.ast(),
      inlineThen: inlineThen.sourceString ? inlineThen.ast()[0] : undefined,
      blockThen: undefined,
    };
  },
  InlineThen(_then, command) {
    return command.ast();
  },
  BlockThen(_then, _1, commandList) {
    return commandList.ast().flat();
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

function parse(code: string): { ast: Ast | null; error: string | null } {
  let match;
  try {
    match = grammar.match(code);
  } catch (e) {
    return { ast: null, error: e.message };
  }
  if (match.succeeded()) {
    return { ast: semantics(match).ast(), error: null };
  } else {
    return { ast: null, error: match.message || "" };
  }
}
export default parse;
