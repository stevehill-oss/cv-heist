// Builds for GitHub Pages and publishes out/ to the gh-pages branch.
// Live at https://stevehill-oss.github.io/cv-heist/ about a minute later.
// Usage: npm run deploy:pages
import { execSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

const repo = "https://github.com/stevehill-oss/cv-heist.git";
const author = ["-c", "user.name=stevehill-oss", "-c", "user.email=311327706+stevehill-oss@users.noreply.github.com"].join(" ");
const run = (cmd, cwd = ".") => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, BASE_PATH: "/cv-heist", NEXT_TELEMETRY_DISABLED: "1" } });

run("npm run build");
writeFileSync("out/.nojekyll", "");
rmSync("out/.git", { recursive: true, force: true });
run("git init -q -b gh-pages", "out");
run("git add -A", "out");
run(`git ${author} commit -q -m "Deploy site"`, "out");
run(`git push -q -f ${repo} gh-pages`, "out");
console.log("Deployed. Live in about a minute: https://stevehill-oss.github.io/cv-heist/");
