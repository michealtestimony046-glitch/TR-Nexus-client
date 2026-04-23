import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

function makePngBuffer(size) {
  // Generate a simple PNG via canvas-free approach using SVG → not possible without lib.
  // Instead, return a data URL referenced PNG by using a tiny embedded raster is overkill.
  // We'll just create an SVG-based icon and trust browsers / use PNGs of solid color.
  return null;
}

// Use sharp if available, else fallback to writing minimal PNG via pngjs alt:
import { Buffer } from 'node:buffer';

// Minimal PNG: solid color of given size with text "T/R" rendered via canvas using node-canvas — not assumed.
// Simpler: ship PNGs by rasterizing an SVG with @resvg/resvg-js if present; otherwise use a very small pre-generated image via base64.

// We embed two pre-rendered PNGs (192 and 512) generated from the SVG icon (deep navy bg, neon T/R).
// To avoid heavy deps, we build solid-color PNG with no text via raw bytes for fallback,
// but for quality we instead emit SVG icons referenced as PNG-equivalent.

// Cleanest: just write SVG copies named .png — browsers won't accept that for manifest.
// So: install sharp at build time? Too heavy.
// Pragmatic path: generate solid-color PNGs via a tiny dependency-free encoder.

import zlib from 'node:zlib';

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makeSolidPng(size, rgb, accent) {
  // RGBA raster — bg with a centered square accent
  const w = size, h = size;
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  const inset = Math.floor(size * 0.22);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter byte
    for (let x = 0; x < w; x++) {
      const i = y * (stride + 1) + 1 + x * 4;
      const inAccent =
        x > inset && x < w - inset &&
        y > size * 0.38 && y < size * 0.62 &&
        ((x + y) % 6 < 4);
      const c = inAccent ? accent : rgb;
      raw[i] = c[0]; raw[i+1] = c[1]; raw[i+2] = c[2]; raw[i+3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const bg = [11, 15, 25];
const neon = [56, 189, 248];

writeFileSync('public/icon-192.png', makeSolidPng(192, bg, neon));
writeFileSync('public/icon-512.png', makeSolidPng(512, bg, neon));
console.log('icons written');
