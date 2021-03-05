import { useState, ChangeEvent } from "react";
import { useThrottleCallback } from "@react-hook/throttle";
import styled from "styled-components/macro";
import parse, { Ast } from "./parse";

const Main = styled.main`
  display: flex;
  width: 100%;
  height: 100%;
`;
const Editor = styled.textarea`
  flex: 1;
  flex-shrink: 0;
  padding: 1rem;
`;
const Preview = styled.div`
  flex: 1;
  padding: 1rem;
`;
const Section = styled.div``;

const defaultText = `set bpm to 120
beat/drums
|xxxx|
| x x|

melody/synth

main/
play beat
play drums| xxx|
play melody 3 times
loop reversed beat
`;

function App() {
  const [code, setCode] = useState(defaultText);
  const [ast, setAst] = useState<Ast | null>(null);
  const generateAst = useThrottleCallback((code) => {
    setAst(parse(code));
  });
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    generateAst(e.target.value);
  };
  return (
    <Main>
      <Editor value={code} onChange={handleChange} />
      <Preview>
        {ast?.sections.map((section) => (
          <Section key={section.name}>
            <h3>{section.name}</h3>
            {section.type === "arrangement" &&
              section.commands.map((command) => (
                <div>
                  {command.type} {command.source.type}
                </div>
              ))}
            {section.type === "instrument" && (
              <>
                <h5>{section.instrument}</h5>
                <div>
                  {section.tracks.map((track) => (
                    <div>{track}</div>
                  ))}
                </div>
              </>
            )}
          </Section>
        ))}
      </Preview>
    </Main>
  );
}

export default App;
