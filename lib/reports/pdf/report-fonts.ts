import path from "node:path";

import { Font } from "@react-pdf/renderer";

let registered = false;

const playfairDir = path.join(process.cwd(), "public/fonts/playfair-display");

/** Playfair Display for the investment report. Files are TTF because the PDF renderer cannot use WOFF. */
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

  registered = true;
}
