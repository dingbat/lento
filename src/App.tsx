import { useState, ChangeEvent } from "react";
import styled from "styled-components/macro";
import compile, { Composition, Error } from "./compile";
import * as Tone from "tone";
import raw from "raw.macro";
import play from "./play";

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
  padding: 2rem;
`;

const DEFAULT_TEXT = raw("../default.txt");
const DEFAULT_COMPOSITION = compile(DEFAULT_TEXT);

function App() {
  const [playing, setPlaying] = useState(false);
  const [code, setCode] = useState(DEFAULT_TEXT);
  const [started, setStarted] = useState(false);
  const [composition, setComposition] = useState<Composition | Error>(DEFAULT_COMPOSITION);
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (playing) {
      togglePlay();
    }
    setCode(e.target.value);
    const composition = compile(e.target.value + "\n");
    setComposition(composition);
  };
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
        play(composition);
        setPlaying(true);
      }
    }
  };
  return (
    <Main>
      <Editor
        value={code}
        onChange={handleChange}
        autoCorrect="none"
        autoComplete="none"
      />
      <Preview>
        <button onClick={togglePlay}>{playing ? "stop" : "play"}</button>
        {composition.error && composition.message}
      </Preview>
    </Main>
  );
}

export default App;
