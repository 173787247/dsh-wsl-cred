import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCredAdvice, formatCredReport } from "../lib/cred.js";

describe("cred_hint", () => {
  it("never invites dumping secrets", () => {
    const advice = buildCredAdvice("");
    assert.ok(advice.every((t) => !/password|token=/i.test(t) || /never/i.test(t)));
    assert.ok(advice.some((t) => /Credential Manager|GCM/i.test(t)));
  });

  it("formats", () => {
    assert.match(formatCredReport({ helper: "manager", advice: ["x"] }), /helper: manager/);
  });
});
