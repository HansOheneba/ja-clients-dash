import path from "node:path";

import { Font } from "@react-pdf/renderer";

let registered = false;

const aktivDir = path.join(process.cwd(), "public/fonts/aktiv-grotesk");
const playfairDir = path.join(
  process.cwd(),
  "node_modules/@fontsource/playfair-display/files",
);

/** Playfair Display (headings) + licensed Aktiv Grotesk (body). */
export function registerReportFonts() {
  if (registered) return;

  Font.register({
    family: "Playfair Display",
    fonts: [
      {
        src: path.join(playfairDir, "playfair-display-latin-400-normal.woff"),
        fontWeight: 400,
      },
      {
        src: path.join(playfairDir, "playfair-display-latin-600-normal.woff"),
        fontWeight: 600,
      },
    ],
  });

  Font.register({
    family: "Aktiv Grotesk",
    fonts: [
      {
        src: path.join(aktivDir, "AktivGrotesk-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(aktivDir, "AktivGrotesk-Italic.ttf"),
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: path.join(aktivDir, "AktivGrotesk-Medium.ttf"),
        fontWeight: 500,
      },
      {
        src: path.join(aktivDir, "AktivGrotesk-Bold.ttf"),
        fontWeight: 600,
      },
      {
        src: path.join(aktivDir, "AktivGrotesk-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  registered = true;
}
