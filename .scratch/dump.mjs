import fs from "node:fs";
import zlib from "node:zlib";

const buf = fs.readFileSync(".scratch/report.pdf");
const streams = [];
let i = 0;
while (true) {
  const s = buf.indexOf("stream", i);
  if (s < 0) break;
  const e = buf.indexOf("endstream", s);
  if (e < 0) break;
  let start = s + 6;
  while (buf[start] === 13 || buf[start] === 10) start += 1;
  try {
    const inflated = zlib.inflateSync(buf.subarray(start, e)).toString("latin1");
    if (inflated.includes("TJ")) streams.push(inflated);
  } catch {
    /* not a flate text stream */
  }
  i = e + 9;
}

console.log("pages with text:", streams.length);
for (const [idx, content] of streams.entries()) {
  const lines = [];
  const arrayRe = /\[([^\]]*)\]\s*TJ/g;
  let m;
  while ((m = arrayRe.exec(content))) {
    const chars = [...m[1].matchAll(/<([0-9a-fA-F]{2,})>/g)]
      .map((h) => h[1].match(/.{2}/g).map((b) => String.fromCharCode(parseInt(b, 16))).join(""))
      .join("");
    if (chars.trim()) lines.push(chars);
  }
  console.log(`\n===== page ${idx + 1} =====`);
  console.log(lines.join(" | "));
}
