import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to create uncompressed/raw RGBA PNG file using standard Node.js zlib
function createPng(width, height, getPixelRGBA) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with 0 filter byte at each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const chunkType = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([chunkType, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, chunkType, data, crc]);
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw a stylized Ganit Ghar math logo
function getPixel(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;

  // Background rounded squircle
  const cornerRadius = 0.22;
  const dx = Math.max(0, Math.abs(nx - cx) - (0.5 - cornerRadius));
  const dy = Math.max(0, Math.abs(ny - cy) - (0.5 - cornerRadius));
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Border (chunky dark navy outline)
  if (dist > cornerRadius - 0.035 || nx < 0.035 || nx > 0.965 || ny < 0.035 || ny > 0.965) {
    return [16, 38, 58, 255]; // #10263a
  }

  // Inner tile (yellow tilted pad)
  const tx = (nx - 0.5) * Math.cos(0.12) - (ny - 0.5) * Math.sin(0.12) + 0.5;
  const ty = (nx - 0.5) * Math.sin(0.12) + (ny - 0.5) * Math.cos(0.12) + 0.5;

  if (tx > 0.22 && tx < 0.78 && ty > 0.22 && ty < 0.78) {
    // Border of center pad
    if (tx < 0.25 || tx > 0.75 || ty < 0.25 || ty > 0.75) {
      return [16, 38, 58, 255];
    }
    // Center Pi symbol placeholder bars
    const px = tx - 0.5;
    const py = ty - 0.5;
    // Top bar of Pi
    if (py > -0.16 && py < -0.09 && px > -0.16 && px < 0.16) {
      return [16, 38, 58, 255];
    }
    // Left leg of Pi
    if (px > -0.12 && px < -0.06 && py >= -0.09 && py < 0.15) {
      return [16, 38, 58, 255];
    }
    // Right leg of Pi (curved)
    if (px > 0.06 && px < 0.12 && py >= -0.09 && py < 0.15) {
      return [16, 38, 58, 255];
    }
    // Warm sunny yellow pad
    return [255, 210, 63, 255]; // #ffd23f
  }

  // Cyan-blue gradient background
  const r = Math.round(76 + (nx * 20));
  const g = Math.round(141 + (ny * 55));
  const b = Math.round(255 - (nx * 70));
  return [r, g, b, 255];
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating Ganit Ghar app icon PNGs...');
const p512 = createPng(512, 512, getPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), p512);

const p192 = createPng(192, 192, getPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), p192);

const p64 = createPng(64, 64, getPixel);
fs.writeFileSync(path.join(iconsDir, 'favicon.png'), p64);

console.log('App icons generated in public/icons/ successfully!');
