/**
 * Generates static PWA icons from SVG using sharp.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

await mkdir(resolve(root, "public/icons"), { recursive: true });

// ── Icon SVG (shopping bag + pencil) ────────────────────────────────────────
function buildSvg(size) {
  const r = Math.round(size * 0.21); // corner radius ~21% for app-icon look
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1c9a77"/>
      <stop offset="55%"  stop-color="#157561"/>
      <stop offset="100%" stop-color="#0e5a47"/>
    </linearGradient>
    <clipPath id="shape">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Icon group, centred in a 100×100 viewport scaled to the output size -->
  <g clip-path="url(#shape)" transform="scale(${size / 100})">

    <!-- Bag handle -->
    <path d="M 34 42 Q 34 22 50 22 Q 66 22 66 42"
          stroke="white" stroke-width="6.5" stroke-linecap="round" fill="none"/>

    <!-- Bag body -->
    <rect x="18" y="40" width="64" height="48" rx="8" fill="white"/>

    <!-- Pencil (rotated −35°, pivot ~centre of pencil) -->
    <g transform="rotate(-35, 47, 65)">
      <!-- Eraser -->
      <rect x="42" y="49" width="10" height="6" rx="2" fill="#a7f3d0"/>
      <!-- Body -->
      <rect x="42" y="55" width="10" height="22" rx="1.5" fill="#157561"/>
      <!-- Tip triangle -->
      <polygon points="42,77 52,77 47,84" fill="#0e5a47"/>
    </g>

  </g>
</svg>`;
}

// ── Generate all sizes ───────────────────────────────────────────────────────
const targets = [
  { file: "public/icons/icon-192.png",     size: 192 },
  { file: "public/icons/icon-512.png",     size: 512 },
  { file: "public/apple-touch-icon.png",   size: 180 },  // iOS looks for this at root
  { file: "public/favicon-32.png",         size: 32  },
];

for (const { file, size } of targets) {
  const svg = Buffer.from(buildSvg(size));
  await sharp(svg).png().toFile(resolve(root, file));
  console.log(`✓ ${file} (${size}×${size})`);
}

console.log("\nDone! Static icons written to public/.");
