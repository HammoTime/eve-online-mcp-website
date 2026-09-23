import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const worker = "eve-online-website-prod";
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (
  process.argv.length !== 2 ||
  !/^[a-f0-9]{32}$/.test(account ?? "") ||
  !process.env.CLOUDFLARE_API_TOKEN?.trim()
)
  throw new Error(
    "Set the production CLOUDFLARE_ACCOUNT_ID and worker-scoped CLOUDFLARE_API_TOKEN; no arguments are accepted.",
  );
if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim())
  throw new Error("Deploy from a clean checkout.");

const directory = await mkdtemp(join(tmpdir(), "eve-website-deploy-"));
const output = join(directory, "wrangler.ndjson");
try {
  execFileSync("npx", ["wrangler", "versions", "upload"], {
    stdio: "inherit",
    env: { ...process.env, WRANGLER_OUTPUT_FILE_PATH: output },
  });
  const entries = (await readFile(output, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const uploads = entries.filter(
    (entry) => entry.type === "version-upload" && entry.worker_name === worker,
  );
  if (
    uploads.length !== 1 ||
    !/^[a-f0-9-]{36}$/.test(uploads[0].version_id ?? "")
  )
    throw new Error(
      "Wrangler did not return exactly one website version; refusing to deploy.",
    );
  execFileSync(
    "npx",
    [
      "wrangler",
      "versions",
      "deploy",
      `${uploads[0].version_id}@100%`,
      "--yes",
    ],
    { stdio: "inherit" },
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
