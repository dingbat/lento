import parse from "./parse";
import raw from "raw.macro";

const contents = raw("../test.txt");

test("parses", () => {
  const tree = parse(contents);
  expect(tree).toEqual({
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
        instrument: "drums",
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
        blocks: [
          {
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
                  instrument: "drums",
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
              },
            ],
          },
        ],
      },
      {
        type: "arrangement",
        name: "main",
        blocks: [
          {
            commands: [
              {
                type: "play",
                times: 1,
                source: {
                  type: "section",
                  name: "intro",
                  reversed: false,
                },
              },
            ],
          },
          {
            commands: [
              {
                type: "play",
                times: 2,
                source: {
                  type: "section",
                  name: "chords",
                  reversed: false,
                },
              },
            ],
          },
          {
            commands: [
              {
                type: "loop",
                source: {
                  type: "section",
                  name: "beat",
                  reversed: true,
                },
              },
            ],
          },
        ],
      },
    ],
  });
});
