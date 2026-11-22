// Entry program for make.fun bounty "bring-the-humans-03".
//
// The entry itself is a TikTok video; this program's only job is to hand
// the grader the pointer to it. It copies VIDEO.json from the bot
// directory (where this repository is mounted) into the output
// directory, byte for byte, and stays silent when that succeeds.
//
// Node 22, standard library only, no network access.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function fail(message: string): never {
  console.error(`bring-the-humans-03: ${message}`);
  process.exit(1);
}

const source = join(botDir, "VIDEO.json");
const destination = join(outputDir, "VIDEO.json");

if (!existsSync(source)) {
  fail(`VIDEO.json is missing from the bot directory: ${source}`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, destination);

// Verify the copy before reporting success: the delivered file must be
// byte-identical to the committed VIDEO.json, and the payload must be a
// JSON object whose "url" names a TikTok video page. Any mismatch is a
// hard failure so a truncated or corrupted hand-off can never pass
// silently.
const wanted = readFileSync(source);
const delivered = readFileSync(destination);
if (!delivered.equals(wanted)) {
  fail(`copied VIDEO.json differs from the source (${delivered.length} vs ${wanted.length} bytes)`);
}

let payload: unknown;
try {
  payload = JSON.parse(delivered.toString("utf8"));
} catch {
  fail("VIDEO.json is not valid JSON");
}

const url =
  typeof payload === "object" && payload !== null
    ? (payload as { url?: unknown }).url
    : undefined;
if (typeof url !== "string" || !url.startsWith("https://www.tiktok.com/")) {
  fail("VIDEO.json does not carry a TikTok video URL in its \"url\" field");
}
