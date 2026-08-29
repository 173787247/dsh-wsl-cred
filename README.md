# dsh-wsl-cred

DeepSeek Harness tool: **`cred_hint`** — report `git credential.helper` and safe guidance for **Windows Git Credential Manager** from WSL.

**Never returns tokens or passwords.**

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 ↓](#中文)

---

## English

### Why

HTTPS git from WSL often fails until credential helper points at Windows GCM (or `gh auth` on Windows). This tool explains the setup without dumping secrets into the chat or prompt.

### Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-cred
```

### Config

```yaml
- id: dsh-wsl-cred
  name: dsh-wsl-cred
  config:
    timeoutMs: 10000
```

### Test

```sh
npm test
```

### License

MIT

---

## 中文

### 为什么需要

WSL 里 `git push` 常因凭据助手未接到 Windows Git Credential Manager 而失败。本工具只报告 `credential.helper` 并给出安全配置建议，**绝不**把 token/密码打进对话。

### 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-cred
```

### 许可

MIT
