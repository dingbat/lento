import parse, { Section, ArrangementSection, BpmSet } from "./parse";

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

function compile(code: string): Composition | Error {
  const ast = parse(code);
  if (!ast) {
    return { error: true, message: "syntax error" };
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
  // check for instantaneous cycles (cycles in a then are ok)

  return {
    error: false,
    main,
    sections,
    bpm: bpmSet?.value || 120,
  };
}

export default compile;
