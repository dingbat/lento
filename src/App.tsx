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
`;

const DEFAULT_TEXT = raw("../default.txt");
const DEFAULT_COMPOSITION = compile(DEFAULT_TEXT);

// (() => {})();

function App() {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [composition, setComposition] = useState<Composition | Error>(
    DEFAULT_COMPOSITION
  );

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
      <Editor ref={editor} />
      <Preview>
        <button onClick={togglePlay}>{playing ? "stop" : "play"}</button>
        {composition.error && composition.message}
      </Preview>
    </Main>
  );
}

export default App;
