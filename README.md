# dsh-wsl-cred

DeepSeek Harness tool: **`cred_hint`** — report `git credential.helper` and safe guidance for **Windows Git Credential Manager** from WSL.

**Never returns tokens or passwords.**

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---

## Why

HTTPS git from WSL often fails until credential helper points at Windows GCM (or `gh auth` on Windows). This tool explains the setup without dumping secrets into the chat or prompt.

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-cred
```

## Config

```yaml
- id: dsh-wsl-cred
  name: dsh-wsl-cred
  config:
    timeoutMs: 10000
```

## Test

```sh
npm test
```

## License

MIT
