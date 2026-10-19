// Scans public/media/{images,audio,icons}/ for files named <monster-id>.<ext>
// and writes src/data/media-manifest.json. The Surveyor mode only offers monsters
// with an image, the Roar mode only monsters with audio. Runs automatically before dev/build.
import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { monsters } = JSON.parse(readFileSync(join(root, 'src/data/monsters.json'), 'utf8'));
const ids = new Set(monsters.map((m) => m.id));

const KINDS = {
  images: ['.webp', '.png', '.jpg', '.jpeg', '.avif'],
  icons: ['.webp', '.png', '.jpg', '.jpeg', '.avif', '.svg'],
  audio: ['.mp3', '.ogg', '.m4a', '.wav', '.opus'],
};

const manifest = { images: {}, icons: {}, audio: {} };
const unknown = [];
for (const [kind, exts] of Object.entries(KINDS)) {
  const dir = join(root, 'public', 'media', kind);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    const ext = extname(file).toLowerCase();
    if (!exts.includes(ext)) continue;
    const id = basename(file, extname(file));
    if (!ids.has(id)) { unknown.push(`${kind}/${file}`); continue; }
    // Paths are relative (no leading slash) so they work under any GitHub Pages sub-path.
    manifest[kind][id] = `media/${kind}/${file}`;
  }
}

writeFileSync(join(root, 'src/data/media-manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(`Media manifest: ${Object.keys(manifest.images).length} images, ${Object.keys(manifest.icons).length} icons, ${Object.keys(manifest.audio).length} audio files.`);
if (unknown.length) console.warn(`Ignored files not matching a monster id (see src/data/monsters.json):\n  ${unknown.join('\n  ')}`);
