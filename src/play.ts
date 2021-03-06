import * as Tone from "tone";
import { Command, ArrangementSection } from "./parse";
import { Composition } from "./compile";

function playbacksFromCommand(
  composition: Composition,
  command: Command
): Playback[] {
  const { source } = command;
  const loop = command.type === "loop" ? true : command.times;
  if (source.type === "inline_track") {
    return [
      new Playback(
        source.track,
        source.instrument,
        source.reversed,
        () => {},
        loop
      ),
    ];
  } else {
    const section = composition.sections[source.name];
    if (section.type === "arrangement") {
      return playbacksFromSection(composition, section);
    } else {
      return section.tracks.map((track) => {
        return new Playback(
          track,
          section.instrument,
          source.reversed,
          () => {},
          loop
        );
      });
    }
  }
}

function playbacksFromSection(
  composition: Composition,
  section: ArrangementSection
) {
  return section.blocks.flatMap((block) => {
    return block.commands.flatMap((command) => {
      return playbacksFromCommand(composition, command);
    });
  });
}

const SYNTH = new Tone.PolySynth().toDestination();
const KIT = new Tone.Sampler({
  urls: {
    A1: "kick.mp3",
    A2: "snare.mp3",
    A3: "hihat.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/drum-samples/breakbeat8/",
}).toDestination();

class Playback {
  track: string[];
  instrument: string;
  reversed: boolean;
  completionCallback: () => void;
  note: number;
  loop: number | boolean;
  complete: boolean;

  constructor(
    track: string,
    instrument: string,
    reversed: boolean,
    completionCallback: () => void,
    loop: number | boolean
  ) {
    this.track = track.split("");
    this.instrument = instrument;
    this.reversed = reversed;
    this.completionCallback = completionCallback;
    this.note = 0;
    this.loop = loop;
    this.complete = false;
  }

  play(time: number) {
    const track = this.reversed ? this.track.reverse() : this.track;
    const beat = track[this.note];
    if (beat !== "-" && beat !== ".") {
      const length = "4n";
      if (this.instrument === "synth") {
        SYNTH.triggerAttackRelease(`${beat}4`, length, time);
      } else {
        const note = beat === "k" ? "A1" : beat === "s" ? "A2" : "A3";
        KIT.triggerAttackRelease(note, length, time);
      }
    }
    this.note = (this.note + 1) % this.track.length;
    if (this.note === 0) {
      if (typeof this.loop === "number") {
        this.loop -= 1;
      }
      if (this.loop === 0 || this.loop === false) {
        this.completionCallback();
        this.complete = true;
      }
    }
  }
}

class Player {
  playbacks: Playback[];

  constructor() {
    this.playbacks = [];
  }

  play(composition: Composition) {
    Tone.Transport.bpm.value = composition.bpm;

    this.playbacks = playbacksFromSection(composition, composition.main);

    Tone.Transport.scheduleRepeat((time) => {
      this.playbacks.forEach((playback) => {
        if (!playback.complete) {
          playback.play(time + 0.1);
        }
      });
    }, "4n");

    Tone.Transport.start();
  }
}

function play(composition: Composition) {
  const player = new Player();
  player.play(composition);
}

export default play;
