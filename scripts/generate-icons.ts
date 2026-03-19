import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVG(size: number): string {
  const padding = size * 0.12;
  const center = size / 2;
  const circleR = (size - padding * 2) * 0.34;
  const offset = circleR * 0.42;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A1A2E"/>
      <stop offset="100%" stop-color="#16213E"/>
    </linearGradient>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#rounded)">
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <!-- Blue circle (thinking) -->
    <circle cx="${center - offset}" cy="${center + offset * 0.15}" r="${circleR}" fill="#4A90D9" opacity="0.7"/>
    <!-- Coral circle (feeling) -->
    <circle cx="${center + offset}" cy="${center - offset * 0.15}" r="${circleR}" fill="#E8727A" opacity="0.7"/>
    <!-- Blend in overlap -->
    <circle cx="${center - offset}" cy="${center + offset * 0.15}" r="${circleR}" fill="#9B6B9E" opacity="0.25"/>
    <circle cx="${center + offset}" cy="${center - offset * 0.15}" r="${circleR}" fill="#9B6B9E" opacity="0.25"/>
    <!-- "Us" text -->
    <text x="${center}" y="${center + size * 0.04}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="600" font-size="${size * 0.24}" fill="#F5F0EB" opacity="0.95">Us</text>
  </g>
</svg>`;
}

async function main() {
  for (const size of sizes) {
    const svg = generateSVG(size);
    const outPath = path.join(outDir, `icon-${size}.png`);
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${outPath}`);
  }
  console.log('All icons generated!');
}

main().catch(console.error);
