import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, colorFn) {
  // RGBA buffer
  // Each scanline has 1 filter byte (0) + width * 4 bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Helper for CRC32
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);

    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression method: 0
  ihdr[11] = 0; // Filter method: 0
  ihdr[12] = 0; // Interlace method: 0

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Brand gradient styling (Indigo/Purple #4f46e5 to #7c3aed to #0f172a)
function brandColor(x, y, w, h, isMaskable = false) {
  const normX = x / w;
  const normY = y / h;

  // Background gradient
  const r = Math.round(79 * (1 - normY) + 15 * normY);
  const g = Math.round(70 * (1 - normY) + 23 * normY);
  const b = Math.round(229 * (1 - normY) + 42 * normY);

  // Center emblem "N" shape
  const cx = normX - 0.5;
  const cy = normY - 0.5;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Inner badge
  if (dist < 0.28) {
    // Stylized gold/amber quill or star
    if (Math.abs(cx) < 0.15 && Math.abs(cy) < 0.22) {
      return [255, 255, 255, 255];
    }
  }

  return [r, g, b, 255];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => brandColor(x, y, w, h)));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => brandColor(x, y, w, h)));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => brandColor(x, y, w, h)));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => brandColor(x, y, w, h, true)));

console.log('Successfully generated PWA icon PNGs in public/ directory!');
