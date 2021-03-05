import ohm from "ohm-js";

import raw from "raw.macro";
const contents = raw("./grammar.ohm");
const grammar = ohm.grammar(contents);
const semantics = grammar.createSemantics().addOperation("ast", {
  Composition(_1, {children}) {
    const statements = children.map((x) => x.ast());
    return {
      settings: statements.filter(x => x.type === "set"),
      sections: statements.filter(x => x.type === "instrument" || x.type === "arrangement"),
    };
  },
  Instrument(header, trackList) {
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
  track(_bar, track, _bar2) {
    return track.sourceString;
  },
  instrumentHeader(_1, name, _slash, instrument, _2, _3) {
    return {name: name.sourceString, instrument: instrument.sourceString};
  },
  Statement(setOrSection, _) {
    return setOrSection.ast();
  },
  set(_set, _1, param, _2, _to, _3, value) {
    return {
      type: "set",
      param: param.sourceString,
      value: value.sourceString,
    };
  },

  Arrangement(header, commandList) {
    const { name } = header.ast();
    return {
      type: "arrangement",
      name,
      commands: commandList.ast().flat(Infinity),
    };
  },
  arrangementHeader(_1, name, _slash, _2) {
    return {name: name.sourceString};
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
  Reverse(_reverse, fragment, times, _times) {
    return {
      type: "reverse",
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
  fragment(ident, track) {
    if (track.sourceString) {
      return {
        type: "inline_track",
        instrument: ident.sourceString,
        track: track.ast()[0],
      };
    } else {
      return {
        type: "section",
        name: ident.sourceString,
      };
    }
  },
});

function parse(composition: string) {
  const match = grammar.match(composition);
  if (match.succeeded()) {
    return semantics(match).ast();
  } else {
    console.log(grammar.trace(composition).toString());
    return null;
  }
}
export default parse;
