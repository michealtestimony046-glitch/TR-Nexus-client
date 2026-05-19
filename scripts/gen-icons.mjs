import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

const SRC = "public/logo.png";
const BG = { r: 11, g: 15, b: 25, alpha: 1 }; // #0b0f19

async function makeIcon(size, outPath, { padRatio = 0.12 } = {}) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await sharp(SRC)
    .resize({ width: inner, height: inner, fit: "contain", background: BG })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outPath);
  console.log("wrote", outPath);
}

await Promise.all([
  makeIcon(192, "public/icon-192.png"),
  makeIcon(512, "public/icon-512.png"),
  makeIcon(180, "public/apple-touch-icon.png", { padRatio: 0.08 }),
  makeIcon(64, "public/favicon-64.png", { padRatio: 0.06 }),
]);
