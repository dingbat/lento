import parse, { Section, Command, ArrangementSection, BpmSet } from "./parse";

type SectionMap = { [key: string]: Section };

export interface Composition {
  error: false;
  main: ArrangementSection;
  sections: SectionMap;
  bpm: number;
}

export interface Error {
  error: true;
  message: string;
}

function checkInstrument(instrument: string): Error | null {
  if (["synth", "kit"].includes(instrument)) {
    return null;
  }
  return {
    error: true,
    message: "only instruments are `synth` and `kit`",
  };
}

function checkSection(
  sections: SectionMap,
  section: ArrangementSection,
  initialError?: Error | null
): Error | null {
  if (section.checked) {
    return initialError || null;
  }
  section.checked = true;
  return checkDefinedSections(sections, section.commands, initialError);
}

function checkDefinedSections(
  sections: SectionMap,
  commands: Command[],
  initialError?: Error | null
): Error | null {
  return commands.reduce<Error | null>((error, command) => {
    if (command.source.type === "inline_track") {
      return error || checkInstrument(command.source.instrument);
    } else {
      const section = sections[command.source.name];
      if (!section) {
        return {
          error: true,
          message: `section "${command.source.name}" not defined`,
        };
      } else {
        if (section.type === "arrangement") {
          error = checkSection(sections, section, error);
        } else {
          error = error || checkInstrument(section.instrument);
        }
        if (command.type === "play") {
          if (command.inlineThen) {
            error = checkDefinedSections(sections, [command.inlineThen], error);
          }
          if (command.blockThen) {
            error = checkDefinedSections(sections, command.blockThen, error);
          }
        }
        return error;
      }
    }
  }, initialError || null);
}

function setMain(commands: Command[]) {
  commands.forEach((command) => {
    if (command.type === "play") {
      command.inMain = true;
      if (command.inlineThen) {
        setMain([command.inlineThen]);
      }
      if (command.blockThen) {
        setMain(command.blockThen);
      }
    }
  });
}

function compile(code: string): Composition | Error {
  const { ast, error: syntaxError } = parse(code);
  if (!ast) {
    return { error: true, message: "syntax error: " + syntaxError };
  }
  const main = ast.sections.find((s) => s.name === "main");
  if (!main) {
    return { error: true, message: "no main/" };
  }
  if (main.type !== "arrangement") {
    return { error: true, message: "main/ must be arrangement" };
  }
  const bpmSet = ast.settings.find((s) => s.param === "bpm") as
    | BpmSet
    | undefined;

  const sections: SectionMap = {};
  const error = ast.sections.reduce<Error | null>((error, section) => {
    if (sections[section.name]) {
      return {
        error: true,
        message: `multiple sections named "${section.name}"`,
      };
    }
    sections[section.name] = section;
    return error;
  }, null);

  if (error) {
    return error;
  }

  setMain(main.commands);
  const error2 = checkSection(sections, main);
  if (error2) {
    return error2;
  }
  // check for instantaneous cycles (cycles in a then are ok)

  return {
    error: false,
    main,
    sections,
    bpm: bpmSet?.value || 120,
  };
}

export default compile;
