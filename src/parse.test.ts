import parse from "./parse";

test("parses", () => {
  const tree = parse(`
set bpm to 120
beat/drums
|xxxx|
| x x|

melody/synth

main/
play beat
play drums| xxx|
play melody 3 times
loop reversed beat
  `);
  expect(tree).toEqual({
    settings: [
      {
        type: "set",
        param: "bpm",
        value: "120",
      },
    ],
    sections: [
      {
        name: "beat",
        type: "instrument",
        instrument: "drums",
        tracks: ["xxxx", " x x"],
      },
      {
        name: "melody",
        type: "instrument",
        instrument: "synth",
        tracks: [],
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
              name: "beat",
              reversed: false,
            },
          },
          {
            type: "play",
            times: 1,
            source: {
              type: "inline_track",
              instrument: "drums",
              track: " xxx",
              reversed: false,
            },
          },
          {
            type: "play",
            times: 3,
            source: {
              type: "section",
              name: "melody",
              reversed: false,
            },
          },
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
  });
});
