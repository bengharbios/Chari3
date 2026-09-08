const fs = require('fs');
const content = `
/* ============================================
   RICH DOCUMENT STYLES (Custom Pages)
   ============================================ */
.rich-document {
  line-height: 1.9;
  font-size: 1.15rem;
  color: #374151;
  text-align: right;
}
.rich-document h2 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #1ABB9C;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
  display: inline-block;
  width: 100%;
}
.rich-document h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin-top: 1.8rem;
  margin-bottom: 0.8rem;
}
.rich-document p {
  margin-bottom: 1.2rem;
}
.rich-document ul {
  list-style-type: none;
  margin-bottom: 1.5rem;
  padding: 0;
}
.rich-document ul li {
  position: relative;
  margin-bottom: 0.75rem;
  padding-right: 1.5rem;
}
.rich-document ul li::before {
  content: "•";
  color: #1ABB9C;
  font-weight: bold;
  font-size: 1.5rem;
  position: absolute;
  right: 0;
  top: -4px;
}
.rich-document b, .rich-document strong {
  color: #111827;
  font-weight: 700;
}
.dark .rich-document {
  color: #d1d5db;
}
.dark .rich-document h2 {
  border-bottom-color: #374151;
}
.dark .rich-document h3, .dark .rich-document b, .dark .rich-document strong {
  color: #f3f4f6;
}
[dir="ltr"] .rich-document {
  text-align: left;
}
[dir="ltr"] .rich-document ul li {
  padding-right: 0;
  padding-left: 1.5rem;
}
[dir="ltr"] .rich-document ul li::before {
  right: auto;
  left: 0;
}
`;
fs.appendFileSync('src/app/globals.css', content);
console.log('Appended successfully');
