import path from "node:path";

import { Font } from "@react-pdf/renderer";

let registered = false;

const playfairDir = path.join(process.cwd(), "public/fonts/playfair-display");
const aktivDir = path.join(process.cwd(), "public/fonts/aktiv-grotesk");

/**
 * Playfair for titles, Aktiv Grotesk for body copy.
 * Files are TTF because the PDF renderer cannot use WOFF.
 */
export function registerReportFonts() {
  if (registered) return;

  Font.register({
    family: "Playfair Display",
    fonts: [
      {
        src: path.join(playfairDir, "PlayfairDisplay-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(playfairDir, "PlayfairDisplay-Italic.ttf"),
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: path.join(playfairDir, "PlayfairDisplay-Medium.ttf"),
        fontWeight: 500,
      },
      {
        src: path.join(playfairDir, "PlayfairDisplay-SemiBold.ttf"),
        fontWeight: 600,
      },
      {
        src: path.join(playfairDir, "PlayfairDisplay-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  const aktivMedium = path.join(aktivDir, "AktivGrotesk-Medium.ttf");
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
      { src: aktivMedium, fontWeight: 500 },
      { src: aktivMedium, fontWeight: 600 },
      {
        src: path.join(aktivDir, "AktivGrotesk-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
