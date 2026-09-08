const fs = require('fs');
const content = `
/* React Quill Output Styles */
.ql-align-center { text-align: center; }
.ql-align-right { text-align: right; }
.ql-align-left { text-align: left; }
.ql-align-justify { text-align: justify; }
.ql-direction-rtl { direction: rtl; text-align: inherit; }
.ql-font-serif { font-family: Georgia, Times New Roman, serif; }
.ql-font-monospace { font-family: Monaco, Courier New, monospace; }
.ql-size-small { font-size: 0.75em; }
.ql-size-large { font-size: 1.5em; }
.ql-size-huge { font-size: 2.5em; }
`;
fs.appendFileSync('src/app/globals.css', content);
console.log('Appended Quill styles successfully');
