// Next 16 static export writes route prefetch files as nested folders
// (e.g. out/heist/__next.heist/__PAGE__.txt) but the client requests the
// flat name (out/heist/__next.heist.__PAGE__.txt). Static hosts then 404.
// Copy each nested file to its flat name so every host serves it.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let copied = 0;

function flatten(dir, prefix, targetDir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const name = `${prefix}.${entry}`;
    if (statSync(full).isDirectory()) flatten(full, name, targetDir);
    else {
      copyFileSync(full, join(targetDir, name));
      copied++;
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry.startsWith("__next.")) flatten(full, entry, dir);
    else walk(full);
  }
}

walk("out");
console.log(`postbuild: flattened ${copied} prefetch file(s).`);
