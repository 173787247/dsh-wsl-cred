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

export function buildCredAdvice(helper) {
  const tips = [
    "This tool never prints tokens or passwords. Do not paste secrets into chat or the system prompt.",
    "Prefer Windows Git Credential Manager from WSL: git config --global credential.helper \"/mnt/c/Program\\ Files/Git/mingw64/bin/git-credential-manager.exe\" (path may vary).",
    "For HTTPS GitHub, `gh auth login` on Windows + GCM often covers WSL git pushes.",
  ];
  if (helper) tips.push(`Current credential.helper: ${helper}`);
  else tips.push("credential.helper is unset in this environment.");
  return tips;
}

export function formatCredReport(report) {
  const lines = ["cred_hint", `helper: ${report.helper || "(none)"}`];
  for (const tip of report.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
