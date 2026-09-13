import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to create uncompressed/deflated raw PNG in pure Node.js
function createPNG(width, height, drawPixel) {
  // RGBA buffer with 1 extra filter byte per scanline
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header: 8 bytes
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Deflate compression
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Draw DockerPlay Brand Icon
function drawDockerPlayIcon(x, y, w, h) {
  const nx = x / w; // 0..1
  const ny = y / h; // 0..1

  // Rounded rectangle background (#090d16 with subtle #0ea5e9 border)
  const cornerR = 0.22;
  const isInsideRoundedRect = (px, py, r) => {
    let dx = Math.max(r - px, 0, px - (1 - r));
    let dy = Math.max(r - py, 0, py - (1 - r));
    return dx * dx + dy * dy <= r * r;
  };

  if (!isInsideRoundedRect(nx, ny, cornerR)) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Border check
  const isInsideInnerRect = isInsideRoundedRect(nx, ny, cornerR - 0.03);
  if (!isInsideInnerRect) {
    return [14, 165, 233, 220]; // #0ea5e9 cyan border
  }

  // Docker Container stack coordinates
  // Block 1 (top left): [0.26, 0.28] to [0.40, 0.40]
  // Block 2 (top right): [0.43, 0.28] to [0.57, 0.40]
  // Block 3 (mid left): [0.26, 0.43] to [0.40, 0.55]
  // Block 4 (mid right): [0.43, 0.43] to [0.57, 0.55]
  const isBlock = (bx1, by1, bx2, by2) => nx >= bx1 && nx <= bx2 && ny >= by1 && ny <= by2;

  if (
    isBlock(0.26, 0.28, 0.40, 0.40) ||
    isBlock(0.43, 0.28, 0.57, 0.40) ||
    isBlock(0.26, 0.43, 0.40, 0.55) ||
    isBlock(0.43, 0.43, 0.57, 0.55)
  ) {
    // Gradient sky blue #38bdf8 to #0284c7
    const grad = (ny - 0.28) / 0.27;
    const r = Math.round(56 * (1 - grad) + 2 * grad);
    const g = Math.round(189 * (1 - grad) + 132 * grad);
    const b = Math.round(248 * (1 - grad) + 199 * grad);
    return [r, g, b, 255];
  }

  // Hull / Base: nx in [0.20, 0.80], ny in [0.58, 0.76] curved bottom
  if (nx >= 0.20 && nx <= 0.80 && ny >= 0.58 && ny <= 0.76) {
    const bottomCurve = 0.58 + 0.18 * (1 - Math.pow((nx - 0.5) / 0.3, 2));
    if (ny <= bottomCurve) {
      return [2, 132, 199, 255]; // #0284c7
    }
  }

  // Glowing Play Button Circle at [0.68, 0.42], radius 0.16
  const playDx = nx - 0.68;
  const playDy = ny - 0.42;
  const playDist = Math.sqrt(playDx * playDx + playDy * playDy);
  if (playDist <= 0.16) {
    if (playDist >= 0.14) {
      return [56, 189, 248, 255]; // Ring
    }
    // Inside triangle check:
    // Vertices: [0.64, 0.34], [0.64, 0.50], [0.76, 0.42]
    const inTriangle = nx >= 0.64 && nx <= 0.75 &&
      Math.abs(ny - 0.42) <= ((0.75 - nx) / (0.75 - 0.64)) * 0.09;
    if (inTriangle) {
      return [56, 239, 125, 255]; // #38ef7d Neon green/emerald
    }
    return [9, 13, 22, 255]; // Dark background behind play
  }

  // Dark background gradient #0f172a to #090d16
  const bgGrad = (nx + ny) / 2;
  const r = Math.round(15 * (1 - bgGrad) + 9 * bgGrad);
  const g = Math.round(23 * (1 - bgGrad) + 13 * bgGrad);
  const b = Math.round(42 * (1 - bgGrad) + 22 * bgGrad);
  return [r, g, b, 255];
}

// Generate ICO file containing 16x16, 32x32, 48x48 PNG entries
function createICO(pngBuffers) {
  const count = pngBuffers.length;
  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4);

  // Directory entries: 16 bytes each
  const dirEntries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i].buf;
    const size = pngBuffers[i].size;
    const dirOffset = i * 16;
    dirEntries[dirOffset] = size >= 256 ? 0 : size;
    dirEntries[dirOffset + 1] = size >= 256 ? 0 : size;
    dirEntries[dirOffset + 2] = 0; // Color count
    dirEntries[dirOffset + 3] = 0; // Reserved
    dirEntries.writeUInt16LE(1, dirOffset + 4); // Color planes
    dirEntries.writeUInt16LE(32, dirOffset + 6); // Bits per pixel
    dirEntries.writeUInt32LE(png.length, dirOffset + 8); // Image size in bytes
    dirEntries.writeUInt32LE(offset, dirOffset + 12); // Offset
    offset += png.length;
  }

  return Buffer.concat([header, dirEntries, ...pngBuffers.map((p) => p.buf)]);
}

// Generate files
const sizes = [16, 32, 48, 64, 96, 144, 192, 512];
const generated = {};

sizes.forEach((s) => {
  generated[s] = createPNG(s, s, drawDockerPlayIcon);
});

// Write PNG files
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-32x32.png'), generated[32]);
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-48x48.png'), generated[48]);
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-96x96.png'), generated[96]);
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-192x192.png'), generated[192]);
fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-touch-icon.png'), generated[192]);
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'apple-icon.png'), generated[192]);

// Write ICO files (containing 16, 32, 48)
const icoBuf = createICO([
  { size: 16, buf: generated[16] },
  { size: 32, buf: generated[32] },
  { size: 48, buf: generated[48] },
]);

fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), icoBuf);
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'favicon.ico'), icoBuf);

console.log('Successfully generated all Favicon and App Icon PNG/ICO formats!');
