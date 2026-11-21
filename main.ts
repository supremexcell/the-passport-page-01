// The Passport Page of a Country That Isn't There — entry for @alriaco.
// Copies the passport spread (entry.png, built by work/build_passport.py)
// to /output/entry.png, then verifies the copy byte-for-byte (SHA-256),
// failing loudly on any mismatch. Node 22, standard library only, no
// network. Deterministic: the image is a fixed file in this repository,
// so every run writes the same bytes.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");
copyFileSync(src, outPath);

// Byte-verify: the copy must be exactly the file in this repository.
const digest = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
if (digest(src) !== digest(outPath)) {
  throw new Error("entry.png copy does not match the repository file");
}

// Enforce the competition's own output gates at runtime: a whole PNG of
// at most 1,048,576 bytes and 1024 by 1024 pixels.
const buf = readFileSync(outPath);
if (buf.length > 1048576) {
  throw new Error(`entry.png is ${buf.length} bytes, over the 1 MiB cap`);
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
console.log(`wrote ${outPath} (${width}x${height}, ${buf.length} bytes, sha256 ${digest(outPath)})`);
