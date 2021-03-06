(this.webpackJsonplento=this.webpackJsonplento||[]).push([[0],{102:function(e,n,t){"use strict";t.r(n);var r=t(6),a=t.n(r),i=t(37),s=t.n(i),o=(t(45),t(2)),c=t.n(o),u=t(3),m=t(4),l=t(23),p=t(5),d=t(15),h=t.n(d).a.grammar('Lento {\n  Composition = newline* Statement*\n  Statement = (set | Section) (newline+ | end)\n\n  set = "set" spaces ("bpm" | "key") spaces "to" spaces alnum+\n\n  Section = Instrument | Arrangement\n\n  Instrument = instrumentHeader (newline+ TrackList)?\n  instrumentHeader = spaces ident "/" ident spaces\n  TrackList = track (newline+ track)*\n  track = "|" (~"|" any)* "|"\n\n  Arrangement = arrangementHeader (newline+ BlockList)?\n  BlockList = Block (newline+ "then" newline+ Block)*\n  arrangementHeader = spaces ident "/"\n  Block = Command (newline+ Command)*\n  Command = Loop | Play\n  Loop = "loop" Fragment\n  Play = "play" Fragment (digit+ "times")?\n\n  Fragment = "reversed"? ident track?\n\n  ident = letter (alnum | "_")*\n  space := " " | "\\t"\n  newline = comment? "\\n"\n  comment = spaces "#" (~"\\n" any)*\n}\n'),f=h.createSemantics().addOperation("ast",{Composition:function(e,n){var t=n.children.map((function(e){return e.ast()}));return{settings:t.filter((function(e){return"set"===e.type})),sections:t.filter((function(e){return"instrument"===e.type||"arrangement"===e.type}))}},Instrument:function(e,n,t){var r=e.ast();return{type:"instrument",instrument:r.instrument,name:r.name,tracks:t.ast().flat()}},TrackList:function(e,n,t){return[e.ast()].concat(Object(p.a)(t.ast()))},track:function(e,n,t){return n.sourceString},instrumentHeader:function(e,n,t,r,a){return{name:n.sourceString,instrument:r.sourceString}},Statement:function(e,n){return e.ast()},set:function(e,n,t,r,a,i,s){switch(t.sourceString){case"bpm":return{type:"set",param:"bpm",value:Number(s.sourceString)};case"key":return{type:"set",param:"key",value:s.sourceString};default:throw new Error("bpm or key expected")}},Arrangement:function(e,n,t){return{type:"arrangement",name:e.ast().name,blocks:t.ast().flat()}},arrangementHeader:function(e,n,t){return{name:n.sourceString}},BlockList:function(e,n,t,r,a){return[e.ast()].concat(Object(p.a)(a.ast()))},Block:function(e,n,t){return{commands:[e.ast()].concat(Object(p.a)(t.ast()))}},Play:function(e,n,t,r){return{type:"play",times:t.sourceString?parseInt(t.sourceString):1,source:n.ast()}},Loop:function(e,n){return{type:"loop",source:n.ast()}},Fragment:function(e,n,t){return t.sourceString?{type:"inline_track",instrument:n.sourceString,track:t.ast()[0],reversed:!!e.sourceString}:{type:"section",name:n.sourceString,reversed:!!e.sourceString}}});var g=function(e){var n;try{n=h.match(e)}catch(t){return null}return n.succeeded()?f(n).ast():(console.log(h.trace(e).toString()),null)};var k=function(e){var n=g(e);if(!n)return{error:!0,message:"syntax error"};var t=n.sections.find((function(e){return"main"===e.name}));if(!t)return{error:!0,message:"no main/"};if("arrangement"!==t.type)return{error:!0,message:"main/ must be arrangement"};var r=n.settings.find((function(e){return"bpm"===e.param})),a={},i=n.sections.reduce((function(e,n){return a[n.name]?{error:!0,message:'multiple sections named "'.concat(n.name,'"')}:(a[n.name]=n,e)}),null);return i||{error:!1,main:t,sections:a,bpm:(null===r||void 0===r?void 0:r.value)||120}},b=t(10),y=t(0),v=t(1);function j(e,n){return n.blocks.flatMap((function(n){return n.commands.flatMap((function(n){return function(e,n){var t=n.source,r="loop"===n.type||n.times;if("inline_track"===t.type)return[new O(t.track,t.instrument,t.reversed,(function(){}),r)];var a=e.sections[t.name];return"arrangement"===a.type?j(e,a):a.tracks.map((function(e){return new O(e,a.instrument,t.reversed,(function(){}),r)}))}(e,n)}))}))}var S=(new b.a).toDestination(),w=new b.b({urls:{A1:"kick.mp3",A2:"snare.mp3",A3:"hihat.mp3"},baseUrl:"https://tonejs.github.io/audio/drum-samples/breakbeat8/"}).toDestination(),O=function(){function e(n,t,r,a,i){Object(y.a)(this,e),this.track=void 0,this.instrument=void 0,this.reversed=void 0,this.completionCallback=void 0,this.note=void 0,this.loop=void 0,this.complete=void 0,this.track=n.split(""),this.instrument=t,this.reversed=r,this.completionCallback=a,this.note=0,this.loop=i,this.complete=!1}return Object(v.a)(e,[{key:"play",value:function(e){var n=(this.reversed?this.track.reverse():this.track)[this.note];if("-"!==n&&"."!==n){if("synth"===this.instrument)S.triggerAttackRelease("".concat(n,"4"),"4n",e);else{var t="k"===n?"A1":"s"===n?"A2":"A3";w.triggerAttackRelease(t,"4n",e)}}this.note=(this.note+1)%this.track.length,0===this.note&&("number"===typeof this.loop&&(this.loop-=1),0!==this.loop&&!1!==this.loop||(this.completionCallback(),this.complete=!0))}}]),e}(),x=function(){function e(){Object(y.a)(this,e),this.playbacks=void 0,this.playbacks=[]}return Object(v.a)(e,[{key:"play",value:function(e){var n=this;b.c.bpm.value=e.bpm,this.playbacks=j(e,e.main),b.c.scheduleRepeat((function(e){n.playbacks.forEach((function(n){n.complete||n.play(e+.1)}))}),"4n"),b.c.start()}}]),e}();var C=function(e){(new x).play(e)},A=t(12),L=l.a.main.withConfig({displayName:"App__Main",componentId:"sc-1hxgy29-0"})(["display:flex;width:100%;height:100%;"]),_=l.a.textarea.withConfig({displayName:"App__Editor",componentId:"sc-1hxgy29-1"})(["flex:1;flex-shrink:0;padding:1rem;"]),B=l.a.div.withConfig({displayName:"App__Preview",componentId:"sc-1hxgy29-2"})(["flex:1;padding:2rem;"]),I="set bpm to 160\nset key to major\n\nbeat/kit\n|hhhh|\n|k.k.|\n|..s...ss|\n\nchords/synth\n|c...g...|\n|e...b...|\n|g...d...|\n\nmelody/synth\n|c---..ddeg---ge.|\n\nintro/\nloop chords\nloop kit|k...|\nplay reversed melody\n\nmain_loop/\nloop beat\nloop chords\nloop melody\n\nmain/\nplay main_loop\n",F=k(I);var H=function(){var e=Object(r.useState)(!1),n=Object(m.a)(e,2),t=n[0],a=n[1],i=Object(r.useState)(I),s=Object(m.a)(i,2),o=s[0],l=s[1],p=Object(r.useState)(!1),d=Object(m.a)(p,2),h=d[0],f=d[1],g=Object(r.useState)(F),y=Object(m.a)(g,2),v=y[0],j=y[1],S=function(){var e=Object(u.a)(c.a.mark((function e(){return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!t){e.next=6;break}b.c.stop(),b.c.cancel(),a(!1),e.next=11;break;case 6:if(h){e.next=9;break}return e.next=9,b.d();case 9:f(!0),v.error||(C(v),a(!0));case 11:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(A.jsxs)(L,{children:[Object(A.jsx)(_,{value:o,onChange:function(e){t&&S(),l(e.target.value);var n=k(e.target.value+"\n");j(n)},autoCorrect:"none",autoComplete:"none"}),Object(A.jsxs)(B,{children:[Object(A.jsx)("button",{onClick:S,children:t?"stop":"play"}),v.error&&v.message]})]})},P=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,103)).then((function(n){var t=n.getCLS,r=n.getFID,a=n.getFCP,i=n.getLCP,s=n.getTTFB;t(e),r(e),a(e),i(e),s(e)}))};s.a.render(Object(A.jsx)(a.a.StrictMode,{children:Object(A.jsx)(H,{})}),document.getElementById("root")),P()},45:function(e,n,t){}},[[102,1,2]]]);
//# sourceMappingURL=main.8b0ba5d7.chunk.js.map