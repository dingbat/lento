import { useState } from "react";
import styled from "styled-components/macro";
import compile, { Composition, Error } from "./compile";
import * as Tone from "tone";
import raw from "raw.macro";
import play from "./play";
import useCodeMirror from "./useCodeMirror";

const Main = styled.main`
  display: flex;
  width: 100%;
  height: 100%;
`;
const Editor = styled.div`
  flex: 2;
  flex-shrink: 0;
`;
const Preview = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: rgb(30,30,30);
`;
const SyntaxError = styled.div`
  color: red;
`;
const DEFAULT_TEXT = `
set bpm to 180

beat/kit
|hhhh|
|k.k.|
|..s.|..ss|

melody/synth
|..ab|..dd|eg..|geab|

a/
play melody then play b

b/
play beat then play a

main/
play beat
` && raw("../default.txt");
const DEFAULT_COMPOSITION = compile(DEFAULT_TEXT);

(() => {})();

function App() {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [composition, setComposition] = useState<Composition | Error>(
    DEFAULT_COMPOSITION
  );

  const togglePlay = async () => {
    if (playing) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setPlaying(false);
    } else {
      if (!started) {
        await Tone.start();
      }
      setStarted(true);
      if (!composition.error) {
        play(composition, () => setPlaying(false));
        setPlaying(true);
      }
    }
  };

  const handleChange = (code: string) => {
    if (playing) {
      togglePlay();
    }
    const composition = compile(code + "\n");
    setComposition(composition);
  };
  const editor = useCodeMirror<HTMLDivElement>({
    doc: DEFAULT_TEXT,
    callback: handleChange,
  });

  return (
    <Main>
      <Editor ref={editor} />
      <Preview>
        <button onClick={togglePlay}>{playing ? "stop" : "play"}</button>
        <SyntaxError><pre>{composition.error && composition.message}</pre></SyntaxError>
      </Preview>
    </Main>
  );
}

export default App;
