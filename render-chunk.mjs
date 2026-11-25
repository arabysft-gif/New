// Renders one shard of the composition: --shard i --total N --out file.mp4 [--project dir]
// Frame ranges are computed from the real composition duration, so the N shards
// cover every frame exactly once. Prints one JSON line on success.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import * as R from "@remotion/renderer";

console.log = console.info = console.warn = console.error = () => {}; // Remotion is chatty
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const shard = Number(arg("--shard", 0));
const total = Number(arg("--total", 20));
const out = path.resolve(arg("--out", `chunk-${shard}.mp4`));
const proj = path.resolve(arg("--project", "project"));
const gl = arg("--gl", "swangle");
const t0 = Date.now();
let last = -1;

const serveUrl = await bundle({
  entryPoint: path.join(proj, "src", "index.jsx"),
  publicDir: path.join(proj, "public"),
  webpackOverride: (c) => c,
});
const common = { serveUrl, id: "main", chromiumOptions: { gl }, logLevel: "error", timeoutInMilliseconds: 900000 };
const composition = await R.selectComposition({ ...common });
const D = composition.durationInFrames;
const start = Math.floor((D * shard) / total);
const end = Math.ceil((D * (shard + 1)) / total) - 1;
if (start > end) {
  process.stdout.write(JSON.stringify({ ok: true, shard, frames: null, empty: true }) + "\n");
  process.exit(0);
}
await R.renderMedia({
  ...common,
  composition,
  codec: "h264",
  outputLocation: out,
  frameRange: [start, end],
  imageFormat: "jpeg",
  jpegQuality: 85,
  crf: 17,
  pixelFormat: "yuv420p",
  colorSpace: "bt709",
  audioCodec: "aac",
  audioBitrate: "256k",
  x264Preset: "medium",
  concurrency: Math.max(1, Math.min(4, os.cpus().length - 1)),
  muted: false,
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 10);
    if (p !== last) { last = p; process.stderr.write(`chunk ${shard}: ${p * 10}%\n`); }
  },
});
process.stdout.write(JSON.stringify({ ok: true, shard, total, frames: [start, end], durationInFrames: D, seconds: +((Date.now() - t0) / 1000).toFixed(1), out }) + "\n");
