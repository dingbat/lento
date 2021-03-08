import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { Transaction, Text } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { commentKeymap } from "@codemirror/comment";
import { MutableRefObject, useEffect, useReducer, useRef } from "react";

import highlightParser from "./highlightParser";

interface Options {
  doc?: string | Text;
  callback?: (newDoc: string) => void;
}

export default function useCodeMirror<T extends Element>(
  options: Options = {}
): MutableRefObject<T | null> {
  const element = useRef<T | null>(null);
  const view = useRef<EditorView | null>(null);

  const [state, dispatch] = useReducer(
    (state: EditorState, transaction: Transaction) => {
      const newState = state.update(transaction).state;
      if (transaction.docChanged && options.callback) {
        options.callback(newState.sliceDoc());
      }
      return newState;
    },
    undefined,
    () =>
      EditorState.create({
        doc: options.doc,
        extensions: [
          basicSetup,
          highlightParser,
          keymap.of(commentKeymap),
        ],
      })
  );

  useEffect(() => {
    if (!element.current) return;

    if (!view.current) {
      view.current = new EditorView({
        state,
        dispatch,
        parent: element.current
      });
    } else if (view.current.state !== state) {
      // TODO: We probably want to dispatch transactions for perf,
      // rather than completely resetting state, but the main idea
      // is that we need to update the view to the latest state here
      view.current.setState(state);
    }

    const container = element.current;
    return () => {
      if (!container) {
        view.current?.destroy();
        view.current = null;
      }
    };
  }, [state]);

  return element;
}
