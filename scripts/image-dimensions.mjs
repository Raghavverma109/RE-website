// Prints "<key>  <width>x<height>" for every image, ready to paste into
// the ImageRef entries in src/content/categories/.
//
// Usage:  npm install -D sharp && node scripts/image-dimensions.mjs
import { readdirSync } from "node:fs";
import { join, posix, sep } from "node:path";
import sharp from "sharp";

const ROOT = "src/assets/images";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = walk(ROOT)
  .filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
  .filter((f) => !f.includes("__fixtures__"));

if (files.length === 0) {
  console.log(`No images found under ${ROOT}/ — export them first.`);
  process.exit(0);
}

for (const file of files) {
  const { width, height } = await sharp(file).metadata();
  const key = file
    .slice(ROOT.length + 1)
    .split(sep)
    .join(posix.sep);
  console.log(`${key}  ${width}x${height}`);
}
