import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCredAdvice,
  classifyRemote,
  findGcmPath,
  formatCredReport,
} from "../lib/cred.js";

describe("classifyRemote", () => {
  it("detects https and ssh", () => {
    assert.equal(classifyRemote("https://github.com/a/b.git").kind, "https");
    assert.equal(classifyRemote("git@github.com:a/b.git").kind, "ssh");
  });

  it("redacts userinfo", () => {
    const r = classifyRemote("https://user:token@github.com/a/b.git");
    assert.equal(r.kind, "https");
    assert.ok(!/token/.test(r.redacted));
  });
});

describe("buildCredAdvice", () => {
  it("routes SSH remotes to ssh_agent_hint", () => {
    const tips = buildCredAdvice("manager", {
      remote: { kind: "ssh", host: "github.com" },
      gcmPath: "",
    });
    assert.ok(tips.some((t) => /ssh_agent_hint/i.test(t)));
  });

  it("suggests GCM when found", () => {
    const gcm = "/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe";
    const tips = buildCredAdvice("", { remote: { kind: "https", host: "github.com" }, gcmPath: gcm });
    assert.ok(tips.some((t) => /Found Windows GCM/i.test(t)));
  });
});

describe("findGcmPath", () => {
  it("returns first existing candidate", () => {
    const p = findGcmPath({
      exists: (x) => x.includes("git-credential-manager.exe"),
    });
    assert.match(p, /git-credential-manager\.exe$/);
  });
});

describe("formatCredReport", () => {
  it("includes origin kind", () => {
    assert.match(
      formatCredReport({ helper: "manager", remoteKind: "https", remoteHost: "github.com", advice: [] }),
      /origin: https github.com/,
    );
  });
});
