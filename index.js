import { detectWsl } from "./lib/wsl-host.js";
import {
  buildCredAdvice,
  classifyRemote,
  findGcmPath,
  formatCredReport,
  gitCredentialHelper,
  gitRemoteUrl,
} from "./lib/cred.js";

export const name = "dsh-wsl-cred";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 10_000);
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:cred_hint",
    order: 122,
    text: "Use cred_hint for Git/GitHub credential setup between Windows and WSL (GCM vs SSH). Never dump secrets; pair with ssh_agent_hint / github_app_hint.",
  });

  ctx.tools.register({
    name: "cred_hint",
    description:
      "Report git credential.helper, detect Windows GCM path, classify origin HTTPS vs SSH (never returns secrets).",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          wsl: { type: "boolean" },
          helper: { type: "string" },
          gcmPath: { type: "string" },
          remoteKind: { type: "string" },
          remoteHost: { type: "string" },
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
      const gcmPath = findGcmPath();
      const remoteInfo = await gitRemoteUrl();
      const remote = classifyRemote(remoteInfo.url);
      return {
        wsl,
        helper,
        gcmPath,
        remoteKind: remote.kind,
        remoteHost: remote.host,
        advice: buildCredAdvice(helper, { remote, gcmPath }),
      };
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
