# Router 🚀 — AI Gateway & Protocol Proxy

High-performance AI gateway, account management pool, and protocol translation proxy built with **Tauri v2**, **React 19**, and **Rust (Axum + Tokio)**.

Router connects client AI tools (such as **Harness Agent**, **Claude Code CLI**, **Cursor**, **Codex**, or custom OpenAI/Claude SDKs) directly to your **Google Antigravity** subscription, automatically managing OAuth token lifecycles, quota routing, and background service execution.

---

## 🤖 Quick Instructions for AI Agents on Remote Machines (e.g. Linux Mint)

If you are an AI agent running on the target machine, follow these direct steps to get the proxy server running with autostart on boot:

### 1. One-Line Setup
```bash
cd linux-mint-proxy
chmod +x setup.sh antigravity-control.sh
./setup.sh
```

### 2. Verify Server Status
```bash
# Check HTTP health
curl -s http://localhost:8045/health
# Response: {"status":"ok","timestamp":...}

# Check systemd user service
systemctl --user status antigravity-router
```

### 3. Machine-to-Machine API Endpoints
* **OpenAI Compatible Base URL**: `http://localhost:8045/v1`
* **Anthropic Claude Messages**: `http://localhost:8045/v1/messages`
* **Google Gemini Native**: `http://localhost:8045/v1beta/models/{model}:generateContent`
* **Health Check**: `http://localhost:8045/health`
* **Web Management Dashboard**: `http://localhost:8045`

### 4. Authentication Token & Config Locations
* **Accounts & Tokens**: `~/.antigravity_tools/accounts/*.json`
* **Server Config & API Key**: `~/.antigravity_tools/gui_config.json`
* **To extract current API key via bash**:
  ```bash
  jq -r '.proxy.api_key' ~/.antigravity_tools/gui_config.json
  ```

---

## 🎯 Supported AI Models (Drop-in Replacement)

Configure your agent or tool with any of the following model names:

| Model ID | Backend Provider | Description |
| :--- | :--- | :--- |
| `gemini-2.5-pro` | Google Antigravity | Best general-purpose reasoning, coding, and context |
| `gemini-3-pro-high` | Google Antigravity | Deepest reasoning tier with thinking budget |
| `gemini-3-flash` | Google Antigravity | Ultra low-latency, fast code completion |
| `claude-sonnet-4-6` | Antigravity Claude Route | High-performance Claude reasoning via proxy mapping |
| `claude-3-5-sonnet` | Antigravity Claude Route | Claude 3.5 Sonnet mapping |

---

## ⚙️ Harness Agent Configuration

When connecting **Harness Agent** to this proxy server:

1. **Provider**: Set to `OpenAI Compatible` (or `Custom API`).
2. **Base URL**: `http://localhost:8045/v1`
3. **API Key**: The key found in `~/.antigravity_tools/gui_config.json` (or set via `API_KEY` environment variable).
4. **Model**: e.g., `gemini-2.5-pro` or `claude-sonnet-4-6`.

### Example Agent SDK Call (Python)
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8045/v1",
    api_key="your-proxy-api-key"  # From ~/.antigravity_tools/gui_config.json
)

response = client.chat.completions.create(
    model="gemini-2.5-pro",
    messages=[{"role": "user", "content": "Hello from Harness Agent!"}]
)
print(response.choices[0].message.content)
```

### Example Agent SDK Call (Node.js / TypeScript)
```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:8045/v1",
  apiKey: process.env.PROXY_API_KEY,
});

const completion = await client.chat.completions.create({
  model: "gemini-2.5-pro",
  messages: [{ role: "user", content: "Write a high-performance Rust function." }],
});
console.log(completion.choices[0].message.content);
```

---

## 🖥️ Linux Mint Desktop & GUI Elements

For human users operating Linux Mint:
* **Desktop Shortcut**: Double-click **"Antigravity Proxy Control"** on your desktop.
* **Terminal GUI**: Run `antigravity-control` in terminal to launch the GTK dialog menu (`zenity`).
* **Key GUI Capabilities**:
  * 🔑 **Authenticate Google Account**: Launches your browser directly to OAuth sign-in to attach your Antigravity subscription.
  * 📋 **View Harness Agent Settings**: Visual dialog showing Base URL, API key, and active models.
  * 🌐 **Open Web Dashboard**: Browser-based account pool management, quota tracker, and custom routing rules.
  * 🔄 **Restart / Stop / Start**: One-click control over the background systemd service.
  * 📜 **View Logs**: Real-time inspection of service logs.

---

## 🏗️ Architecture & How It Works

```
┌─────────────────────────────────────────────────────────┐
│               Client AI Tools & Agents                 │
│         (Harness Agent / Claude Code / Cursor)          │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / SSE
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Router (Axum)                       │
│  Port: 8045                                             │
│  ├─ /v1/chat/completions   (OpenAI Adapter)             │
│  ├─ /v1/messages           (Anthropic Adapter)          │
│  ├─ /v1beta/models/...     (Gemini Native)              │
│  └─ /health                (Status Check)               │
├─────────────────────────────────────────────────────────┤
│                  Core Engine (Rust)                     │
│  ├─ TokenManager (Multi-account pool & auto-refresh)    │
│  ├─ Request Transformer (JSON/Protobuf mapping)         │
│  ├─ Quota & Circuit Breaker Manager                     │
│  └─ Session Stickiness & Round-Robin Load Balancer      │
└───────────────────────────┬─────────────────────────────┘
                            │ Upstream OAuth Bearer
                            ▼
┌─────────────────────────────────────────────────────────┐
│          Google Cloud Code / Antigravity API            │
│  (https://cloudcode-pa.googleapis.com/v1internal)       │
└─────────────────────────────────────────────────────────┘
```

1. **Protocol Transformation**: Incoming standard OpenAI / Claude JSON bodies are sanitized, mapped, and translated to Google Cloud Code's internal protobuf/JSON format.
2. **Token Management**: The proxy loads stored Google OAuth tokens from `~/.antigravity_tools/accounts/*.json`. When an `access_token` is within 15 minutes of expiration, it automatically contacts Google OAuth (`https://oauth2.googleapis.com/token`) to refresh it.
3. **Fault Tolerance**: If rate-limited (`429`) or quota is exceeded on one account, the router automatically fails over to the next available account in the pool.

---

## 🛠️ Service Management Commands (systemd)

On Linux Mint / Ubuntu, the server runs as a systemd user service:

```bash
# Check service status
systemctl --user status antigravity-router

# Restart the service
systemctl --user restart antigravity-router

# Stop the service
systemctl --user stop antigravity-router

# View live log output
journalctl --user -u antigravity-router -f -n 100

# Verify autostart is enabled
systemctl --user is-enabled antigravity-router
```

---

## 💻 Development & Build Setup

### Prerequisites
* Node.js (v18+) & pnpm / npm
* Rust toolchain (`rustup`, `cargo`)
* WebKitGTK & Tauri prerequisites (for desktop GUI mode)

### Build Frontend & Release Binary
```bash
# Install frontend dependencies
npm install

# Build frontend static files
npm run build

# Build Tauri desktop release
npm run tauri build

# Run headless directly from Cargo
cargo run --manifest-path src-tauri/Cargo.toml -- --headless
```

---

## 🐳 Docker Alternative (Headless)

If you prefer running via Docker on Linux:

```bash
docker run -d \
  --name antigravity-manager \
  --restart unless-stopped \
  -p 8045:8045 \
  -e API_KEY=your-custom-secret-key \
  -v ~/.antigravity_tools:/root/.antigravity_tools \
  router:latest
```

---

## 📄 License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](./LICENSE).
