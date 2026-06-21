/**
 * Tiny zero-dependency .env loader shared by the CLI scripts (seed, stripe-setup,
 * security-audit). We deliberately avoid a `dotenv` dependency: these scripts run
 * with `tsx` outside Next.js, so `process.env` is not pre-populated from
 * `.env.local`. This reads `.env.local` (then `.env`) and fills any missing keys.
 *
 * Real environment variables already present always win over file values.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function parse(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of contents.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Load `.env.local` then `.env` into `process.env` without overwriting existing vars. */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      const parsed = parse(readFileSync(resolve(process.cwd(), file), "utf8"));
      for (const [k, v] of Object.entries(parsed)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    } catch {
      // File missing is fine; real env vars may already be set.
    }
  }
}

/** Read a required env var or exit with a clear message. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n✗ Missing required env var: ${name}`);
    console.error(`  Add it to .env.local (see .env.example) and re-run.\n`);
    process.exit(1);
  }
  return v;
}
