import * as Tone from "tone";
import { Command, ArrangementSection } from "./parse";
import { Composition } from "./compile";

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
  currentLoop: number | boolean;
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
    this.loop = loop;
    this.complete = false;
    this.note = 0;
    this.currentLoop = this.loop;
  }

  reset() {
    this.complete = false;
    this.note = 0;
    this.currentLoop = this.loop;
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
      if (typeof this.currentLoop === "number") {
        this.currentLoop -= 1;
      }
      if (this.currentLoop === 0 || this.currentLoop === false) {
        this.complete = true;
        this.completionCallback();
      }
    }
  }

  stop() {
    this.complete = true;
  }
}

class Player {
  composition: Composition;
  playbacks: Playback[];

  constructor(composition: Composition) {
    this.composition = composition;
    this.playbacks = [];
  }

  play() {
    Tone.Transport.bpm.value = this.composition.bpm;

    this.playSection(this.composition.main, 1, () => {
      console.log("done");
    });

    Tone.Transport.scheduleRepeat((time) => {
      this.playbacks.forEach((playback) => {
        if (!playback.complete) {
          playback.play(time + 0.1);
        }
      });
    }, "4n");

    Tone.Transport.start();
  }

  playSection(
    section: ArrangementSection,
    loop: boolean | number,
    onComplete: () => void
  ): Playback[] {
    const commandFinished = () => {
      if (loop === true) {
        playbacks.forEach((pb) => pb.reset());
      } else if (loop === false) {
        playbacks.forEach((pb) => pb.stop());
        onComplete();
      } else {
        loop -= 1;
        if (loop === 0) {
          playbacks.forEach((pb) => pb.stop());
          onComplete();
        } else {
          playbacks.forEach((pb) => pb.reset());
        }
      }
    };
    const playbacks = section.commands.flatMap((command) => {
      return this.playCommand(command, commandFinished);
    });
    return playbacks;
  }

  playCommand(command: Command, onComplete: () => void): Playback[] {
    const { source } = command;
    const loop = command.type === "loop" ? true : command.times;
    const handleComplete = () => {
      if (command.type === "play") {
        const completeBlock = () => {
          onComplete();
          if (command.blockThen) {
            this.playCommand(command.blockThen, () => {});
          }
        };
        if (command.inlineThen) {
          this.playCommand(command.inlineThen, completeBlock);
        } else {
          completeBlock();
        }
      }
    };
    if (source.type === "inline_track") {
      const playback = new Playback(
        source.track,
        source.instrument,
        source.reversed,
        handleComplete,
        loop
      );
      this.playbacks.push(playback);
      return [playback];
    } else {
      const section = this.composition.sections[source.name];
      if (section.type === "arrangement") {
        return this.playSection(section, loop, handleComplete);
      } else {
        const playbacks = section.tracks.map((track) => {
          return new Playback(
            track,
            section.instrument,
            source.reversed,
            handleComplete,
            loop
          );
        });
        this.playbacks.push(...playbacks);
        return playbacks;
      }
    }
  }
}

function play(composition: Composition) {
  const player = new Player(composition);
  player.play();
}

export default play;
