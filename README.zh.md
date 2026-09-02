# dsh-wsl-cred
> **套件安装：** 见 [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)。推荐 `KIT_SET=daily` | `llm` | `github` | `full`。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。


DeepSeek Harness 工具：**`cred_hint`** — 从 WSL 报告 `git credential.helper`，并给出对接 **Windows Git Credential Manager** 的安全建议。

**绝不返回 token 或密码。**

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

---

## 为什么需要

WSL 里 HTTPS git 常因凭据助手未指向 Windows GCM（或 Windows 上的 `gh auth`）而失败。本工具只说明怎么配，**不会**把密钥打进对话或 prompt。

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-cred
```

## 配置

```yaml
- id: dsh-wsl-cred
  name: dsh-wsl-cred
  config:
    timeoutMs: 10000
```

## 测试

```sh
npm test
```

## 许可

MIT
