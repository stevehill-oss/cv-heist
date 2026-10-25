// Minimal static server for the exported site in out/. Applies the same
// security headers as vercel.json so local tests see production behaviour.
// Usage: node scripts/serve.mjs [port]
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const basePath = process.env.BASE_PATH ?? "";
const headers = Object.fromEntries(
  JSON.parse(readFileSync("vercel.json", "utf8")).headers[0].headers.map((h) => [h.key, h.value]),
);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain", ".pdf": "application/pdf",
  ".ico": "image/x-icon", ".vcf": "text/vcard",
};

if (!existsSync(root)) {
  console.error("out/ not found. Run `npm run build` first.");
  process.exit(1);
}

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || "/";
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) {
    res.writeHead(400).end();
    return;
  }
  let target = file;
  if (existsSync(target) && statSync(target).isDirectory()) {
    if (!path.endsWith("/")) {
      res.writeHead(308, { Location: `${basePath}${path}/` }).end();
      return;
    }
    target = join(target, "index.html");
  }
  let status = 200;
  if (!existsSync(target)) {
    status = 404;
    target = join(root, "404.html");
  }
  res.writeHead(status, { ...headers, "Content-Type": types[extname(target)] ?? "application/octet-stream" });
  createReadStream(target).pipe(res);
}).listen(port, () => console.log(`Serving out/ on http://localhost:${port}${basePath}/`));
