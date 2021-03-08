import { StreamLanguage } from "@codemirror/stream-parser";

const language = StreamLanguage.define({
  languageData: {
    commentTokens: {
      line: "#",
    },
  },
  token: function (stream) {
    let tag = "";
    const previousString = stream.string.substring(0, stream.pos);
    const boundary = previousString.match(/(^| )$/);
    if (boundary && stream.match(/^(loop|play|set|to)( |$)/)) {
      stream.backUp(1);
      tag = "keyword";
    } else if (boundary && stream.match(/^then( |$)/)) {
      stream.backUp(1);
      tag = "strong";
    } else if (boundary && stream.match(/^\d+ times/)) {
      stream.backUp(1);
      tag = "bool";
    } else if (boundary && stream.match(/reversed( |%)/)) {
      stream.backUp(1);
      tag = "bool";
    } else if (previousString.match(/ *set +$/)) {
      // set statement parameter
      stream.match(/^[a-z]+/);
    } else if (previousString.match(/ +to +$/) && stream.match(/^[^# ]*/)) {
      // set statement value
      stream.backUp(1);
      tag = "character";
    } else if (stream.match(/^#.*/)) {
      tag = "comment";
    } else if (previousString.match(/\|$/) && stream.match(/^[^|#]+\|/)) {
      // track notes
      tag = "labelName";
      stream.backUp(1);
    } else if (stream.match(/^\|/)) {
      // track bar
      tag = "meta";
      stream.backUp(1);
    } else if (stream.match(/^[^/]+\//)) {
      // section name
      stream.backUp(2);
      tag = "strong";
    } else if (previousString.match(/\/$/) && stream.match(/^[^#]+/)) {
      stream.backUp(1);
      tag = "emphasis";
    } else if (previousString.match(/^[^|]*$/) && stream.match(/^[^ |]+ *\|/)) {
      // inline instrument
      stream.backUp(2);
      tag = "emphasis";
    }
    stream.next();
    return tag;
  },
});

export default language;
