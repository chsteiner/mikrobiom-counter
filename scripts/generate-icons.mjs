/**
 * Generate PWA icons for Play Store from SVG.
 * Run: node scripts/generate-icons.mjs
 *
 * Generates:
 *   public/pwa-192x192.png  — standard icon
 *   public/pwa-512x512.png  — standard icon + Play Store icon
 *   public/pwa-maskable-512x512.png — maskable icon (safe zone padding)
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// App icon SVG — green circle with "30" and a leaf accent
// Designed for 512x512 with maskable safe zone (center 80% = 409x409)
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#40916c"/>
      <stop offset="100%" stop-color="#1b4332"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)"/>
  <!-- Subtle leaf shape top-right -->
  <path d="M340 100 Q380 140 360 200 Q340 180 320 170 Q310 130 340 100Z"
        fill="#52b788" opacity="0.5"/>
  <path d="M360 90 Q400 120 385 180 Q365 160 350 150 Q340 115 360 90Z"
        fill="#52b788" opacity="0.3"/>
  <!-- Number 30 -->
  <text x="256" y="300" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="200" font-weight="bold" fill="white"
        letter-spacing="-8">30</text>
  <!-- Small plant/sprout below -->
  <line x1="256" y1="330" x2="256" y2="380" stroke="#95d5b2" stroke-width="5" stroke-linecap="round"/>
  <path d="M256 360 Q240 345 230 350 Q240 355 256 360Z" fill="#95d5b2"/>
  <path d="M256 345 Q272 330 282 335 Q272 340 256 345Z" fill="#95d5b2"/>
</svg>`.trim();

// Maskable icon needs more padding — content in center 80%
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#40916c"/>
      <stop offset="100%" stop-color="#1b4332"/>
    </linearGradient>
  </defs>
  <!-- Full background (maskable needs full bleed) -->
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- Leaf accents -->
  <path d="M340 120 Q380 160 360 220 Q340 200 320 190 Q310 150 340 120Z"
        fill="#52b788" opacity="0.4"/>
  <path d="M360 110 Q400 140 385 200 Q365 180 350 170 Q340 135 360 110Z"
        fill="#52b788" opacity="0.25"/>
  <!-- Number 30 — slightly smaller for safe zone -->
  <text x="256" y="295" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="180" font-weight="bold" fill="white"
        letter-spacing="-6">30</text>
  <!-- Small sprout -->
  <line x1="256" y1="320" x2="256" y2="365" stroke="#95d5b2" stroke-width="5" stroke-linecap="round"/>
  <path d="M256 350 Q240 335 230 340 Q240 345 256 350Z" fill="#95d5b2"/>
  <path d="M256 337 Q272 322 282 327 Q272 332 256 337Z" fill="#95d5b2"/>
</svg>`.trim();

async function generate() {
  // Standard icons
  for (const size of [192, 512]) {
    const buf = await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toBuffer();
    const path = join(publicDir, `pwa-${size}x${size}.png`);
    writeFileSync(path, buf);
    console.log(`Created: public/pwa-${size}x${size}.png (${buf.length} bytes)`);
  }

  // Maskable icon (512 only)
  const maskBuf = await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toBuffer();
  const maskPath = join(publicDir, 'pwa-maskable-512x512.png');
  writeFileSync(maskPath, maskBuf);
  console.log(`Created: public/pwa-maskable-512x512.png (${maskBuf.length} bytes)`);

  // Also update favicon.svg with the nicer design
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#40916c"/>
      <stop offset="100%" stop-color="#1b4332"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#bg)"/>
  <text x="256" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="200" font-weight="bold" fill="white" letter-spacing="-8">30</text>
  <line x1="256" y1="330" x2="256" y2="380" stroke="#95d5b2" stroke-width="5" stroke-linecap="round"/>
  <path d="M256 360 Q240 345 230 350 Q240 355 256 360Z" fill="#95d5b2"/>
  <path d="M256 345 Q272 330 282 335 Q272 340 256 345Z" fill="#95d5b2"/>
</svg>`;
  writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('Updated: public/favicon.svg');
}

generate().catch(console.error);
