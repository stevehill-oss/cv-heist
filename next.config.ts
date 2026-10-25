import type { NextConfig } from "next";

// Static export: the whole site is plain files, so it runs on any free host
// (GitHub Pages, Vercel Hobby, Netlify) with no server and no paid domain.
// BASE_PATH is only needed when the host serves the site from a sub-folder,
// e.g. GitHub Pages project sites: BASE_PATH=/cv-heist
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
