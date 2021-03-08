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
    if (reversed) {
      this.track = this.track.reverse();
    }
    this.instrument = instrument;
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
    const beat = this.track[this.note];
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
      if (this.currentLoop <= 0 || this.currentLoop === false) {
        this.complete = true;
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

  play(onComplete: () => void) {
    Tone.Transport.bpm.value = this.composition.bpm;

    this.playSection(this.composition.main, 1, false, onComplete, true);

    Tone.Transport.scheduleRepeat((time) => {
      let callbacks: (() => void)[] = [];
      this.playbacks.forEach((playback) => {
        if (!playback.complete) {
          playback.play(time + 0.1);
          if (playback.complete) {
            callbacks.push(playback.completionCallback);
          }
        }
      });
      callbacks.forEach((c) => c());
    }, "4n");

    Tone.Transport.start();
  }

  playSection(
    section: ArrangementSection,
    loop: boolean | number,
    reversed: boolean,
    onComplete: () => void,
    allowInfiniteLoops = false
  ): Playback[] {
    return this.playCommands(
      section.commands,
      loop,
      reversed,
      onComplete,
      allowInfiniteLoops
    );
  }

  playCommands(
    commands: Command[],
    loop: boolean | number,
    reversed: boolean,
    onComplete: () => void,
    allowInfiniteLoops = false
  ): Playback[] {
    const commandFinished = () => {
      const allPlaybackComplete = playbacks.every(
        (p) => (!allowInfiniteLoops && p.loop === true) || p.complete
      );
      if (allPlaybackComplete) {
        if (typeof loop === "number") {
          loop -= 1;
        }
        if (loop === true) {
          playbacks.forEach((pb) => pb.reset());
        } else if (loop === false || loop <= 0) {
          playbacks.forEach((pb) => pb.stop());
          onComplete();
        } else {
          playbacks.forEach((pb) => pb.reset());
        }
      }
    };
    const playbacks = commands.flatMap((command) => {
      return this.playCommand(command, reversed, commandFinished);
    });
    return playbacks;
  }

  playCommand(
    command: Command,
    reversed: boolean,
    onComplete: () => void
  ): Playback[] {
    const { source } = command;
    reversed = reversed ? !source.reversed : source.reversed;
    const loop = command.type === "loop" ? true : command.times;
    const handleComplete = () => {
      if (command.type === "play") {
        const completeBlock = () => {
          if (command.blockThen) {
            this.playCommands(
              command.blockThen,
              false,
              reversed,
              onComplete,
              command.inMain
            );
          } else {
            onComplete();
          }
        };
        if (command.inlineThen) {
          this.playCommand(command.inlineThen, reversed, completeBlock);
        } else {
          completeBlock();
        }
      }
    };
    if (source.type === "inline_track") {
      const playback = new Playback(
        source.track,
        source.instrument,
        reversed,
        handleComplete,
        loop
      );
      this.playbacks.push(playback);
      return [playback];
    } else {
      const section = this.composition.sections[source.name];
      if (section.type === "arrangement") {
        return this.playSection(section, loop, reversed, handleComplete);
      } else {
        const playbacks = section.tracks.map((track) => {
          return new Playback(
            track,
            section.instrument,
            reversed,
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

function play(composition: Composition, onComplete: () => void) {
  const player = new Player(composition);
  player.play(onComplete);
}

export default play;
