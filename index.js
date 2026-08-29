import { detectWsl } from "./lib/wsl-host.js";
import { buildCredAdvice, formatCredReport, gitCredentialHelper } from "./lib/cred.js";

export const name = "dsh-wsl-cred";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 10_000);
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:cred_hint",
    order: 122,
    text: "Use cred_hint for Git/GitHub credential setup between Windows and WSL. Never dump secrets into prompts; use Windows Git Credential Manager.",
  });

  ctx.tools.register({
    name: "cred_hint",
    description: "Report git credential.helper and safe guidance for Windows GCM from WSL (never returns secrets).",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          wsl: { type: "boolean" },
          helper: { type: "string" },
          advice: { type: "array", items: { type: "string" } },
        },
      },
      render: (_args, value) => [{ type: "text", text: formatCredReport(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute() {
      const helperInfo = await gitCredentialHelper();
      const helper = helperInfo.helper || "";
      return { wsl, helper, advice: buildCredAdvice(helper) };
    },
    presentCall: () => ({ card: "generic", title: "Credential hint" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "Credential hint failed", content: result.content }
        : { card: "generic", title: "Credential hint", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
