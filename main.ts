// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: this program copies POST.json from the
// repository root to /output/POST.json, where the gate reads it. The house
// reads the post from X (its first picture and its text) and hands that to
// the judge. Nothing this program writes about the post is judged.
//
// POST.json is added once the meme is posted on X; it holds one line:
//   {"url": "https://x.com/<handle>/status/<id>"}
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

// Read first, so a missing or malformed POST.json fails loudly instead of
// copying a bad file into /output.
const raw = readFileSync(source, 'utf8');
const parsed: unknown = JSON.parse(raw);
const url = (parsed as { url?: unknown } | null)?.url;
const isPostUrl =
  typeof url === 'string' &&
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+([?#].*)?$/.test(
    url,
  );

if (!isPostUrl) {
  console.error(
    'POST.json must hold {"url": "https://x.com/<handle>/status/<id>"}',
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, target);

// Confirm the copy landed byte for byte: the gate reads /output/POST.json,
// so a partial or stale copy must fail here, not silently pass.
if (readFileSync(target, 'utf8') !== raw) {
  console.error('POST.json copy to /output did not match the source');
  process.exit(1);
}
