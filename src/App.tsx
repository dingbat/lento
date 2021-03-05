import { useState, ChangeEvent } from 'react';
import {useThrottleCallback} from '@react-hook/throttle';
import styled from 'styled-components/macro';
import parse from "./parse";

const Main = styled.main`
  display: flex;
  width: 100%;
  height: 100%;
`;
const Editor = styled.textarea`
  flex: 1;
  flex-shrink: 0;
`;
const Preview = styled.div`
  flex: 1;
`;

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
  const [ast, setAst] = useState<any>(null);
  const generateAst = useThrottleCallback((code) => {
    console.log(code);
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
        <pre>{JSON.stringify(ast, null, 2)}</pre>
      </Preview>
    </Main>
  );
}

export default App;
