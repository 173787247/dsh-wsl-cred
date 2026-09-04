import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function gitCredentialHelper({ execFileFn = execFileAsync } = {}) {
  try {
    const { stdout } = await execFileFn("git", ["config", "--get", "credential.helper"], {
      encoding: "utf8",
      timeout: 5_000,
    });
    return { ok: true, helper: String(stdout || "").trim() };
  } catch {
    return { ok: true, helper: "" };
  }
}

export async function gitRemoteUrl({ execFileFn = execFileAsync } = {}) {
  try {
    const { stdout } = await execFileFn("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      timeout: 5_000,
    });
    return { ok: true, url: String(stdout || "").trim() };
  } catch {
    return { ok: false, url: "" };
  }
}

/** Classify remote without exposing tokens (strip userinfo). */
export function classifyRemote(url) {
  const raw = String(url || "").trim();
  if (!raw) return { kind: "none", host: "", redacted: "" };
  if (/^git@/i.test(raw) || /^ssh:\/\//i.test(raw)) {
    const host = (raw.match(/git@([^:]+):/) || raw.match(/ssh:\/\/(?:[^@]+@)?([^/]+)/) || [])[1] || "";
    return { kind: "ssh", host, redacted: raw.replace(/:[^@]+@/, ":***@") };
  }
  try {
    const u = new URL(raw);
    if (u.username || u.password) {
      u.username = "***";
      u.password = "";
    }
    return { kind: "https", host: u.hostname, redacted: u.toString() };
  } catch {
    return { kind: "other", host: "", redacted: raw.slice(0, 80) };
  }
}

export function findGcmPath({ exists = existsSync } = {}) {
  const candidates = [
    "/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe",
    "/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager-core.exe",
    "/mnt/c/Program Files (x86)/Git/mingw64/bin/git-credential-manager.exe",
  ];
  for (const p of candidates) {
    if (exists(p)) return p;
  }
  return "";
}

export function buildCredAdvice(helper, { remote = null, gcmPath = "" } = {}) {
  const tips = [
    "This tool never prints tokens or passwords. Do not paste secrets into chat or the system prompt.",
  ];
  if (helper) tips.push(`Current credential.helper: ${helper}`);
  else tips.push("credential.helper is unset in this environment.");

  if (gcmPath) {
    tips.push(`Found Windows GCM at ${gcmPath}`);
    if (!/credential-manager/i.test(helper || "")) {
      tips.push(
        `Wire it from WSL: git config --global credential.helper "${gcmPath.replace(/ /g, "\\ ")}"`,
      );
    }
  } else {
    tips.push(
      "Prefer Windows Git Credential Manager from WSL when installed under Program Files\\Git\\mingw64\\bin\\.",
    );
  }

  if (remote?.kind === "https") {
    tips.push(
      `origin is HTTPS (${remote.host || "host"}) — GCM / gh auth login on Windows usually covers WSL git push.`,
    );
    tips.push("GitHub App API tokens (github_app_hint) do not replace git push credentials.");
  } else if (remote?.kind === "ssh") {
    tips.push(`origin is SSH (${remote.host || "host"}) — use ssh_agent_hint / ssh-add, not GCM.`);
  } else if (remote?.kind === "none") {
    tips.push("No git origin in cwd — advice is environment-wide only.");
  }

  tips.push("For HTTPS GitHub, `gh auth login` on Windows + GCM often covers WSL git pushes.");
  tips.push("Pair with github_app_hint for read-only PR/Actions API (separate from push auth).");
  return tips;
}

export function formatCredReport(report) {
  const lines = ["cred_hint", `helper: ${report.helper || "(none)"}`];
  if (report.gcmPath) lines.push(`gcm: ${report.gcmPath}`);
  if (report.remoteKind) lines.push(`origin: ${report.remoteKind}${report.remoteHost ? ` ${report.remoteHost}` : ""}`);
  for (const tip of report.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
