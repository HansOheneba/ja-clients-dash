// Generates the dark JA Wealth wordmark from the white source asset.
// The brand file only ships a white-on-transparent wordmark, so the dark
// variant used on light surfaces and the PDF letterhead is derived here.
// Run with: node scripts/make-logo-variants.mjs

import sharp from "sharp";

const SOURCE = "public/logos/JA_Wealth_wht.png";
const OUTPUT = "public/logos/JA_Wealth_blk.png";
// The source is 300px wide, too soft for print at the PDF letterhead size.
const PRINT_WIDTH = 900;

const info = await sharp(SOURCE)
  .negate({ alpha: false })
  .resize({ width: PRINT_WIDTH, kernel: "lanczos3" })
  .png()
  .toFile(OUTPUT);

console.log(`${OUTPUT} written: ${info.width}x${info.height}, ${info.size} bytes`);
