import parse from "./parse";
import raw from "raw.macro";

const contents = raw("../test.txt");

test("parses  test.txt", () => {
  const { ast } = parse(contents);
  expect(ast).toEqual({
    settings: [
      {
        type: "set",
        param: "bpm",
        value: 120,
      },
      {
        type: "set",
        param: "key",
        value: "major",
      },
    ],
    sections: [
      {
        name: "beat",
        type: "instrument",
        instrument: "kit",
        tracks: ["hhhh", "k...", "..s."],
      },
      {
        name: "melody",
        type: "instrument",
        instrument: "synth",
        tracks: ["c---..ddeg---ge."],
      },
      {
        type: "arrangement",
        name: "intro",
        commands: [
          {
            type: "loop",
            source: {
              type: "section",
              name: "chords",
              reversed: false,
            },
          },
          {
            type: "loop",
            source: {
              type: "inline_track",
              instrument: "kit",
              track: "k...",
              reversed: false,
            },
          },
          {
            type: "play",
            times: 1,
            source: {
              type: "section",
              name: "melody",
              reversed: true,
            },
            inlineThen: undefined,
            blockThen: undefined,
          },
        ],
      },
      {
        type: "arrangement",
        name: "main",
        commands: [
          {
            type: "play",
            times: 1,
            source: {
              type: "section",
              name: "intro",
              reversed: false,
            },
            inlineThen: {
              type: "play",
              times: 2,
              source: {
                type: "section",
                name: "chords",
                reversed: false,
              },
              inlineThen: undefined,
              blockThen: undefined,
            },
            blockThen: [
              {
                type: "loop",
                source: {
                  type: "section",
                  name: "beat",
                  reversed: true,
                },
              },
              {
                type: "loop",
                source: {
                  type: "inline_track",
                  instrument: "kit",
                  track: "k",
                  reversed: false,
                },
              },
            ],
          },
        ],
      },
    ],
  });
});
