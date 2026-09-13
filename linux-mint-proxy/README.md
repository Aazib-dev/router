# 🚀 Antigravity Proxy for Linux Mint (Auto-start & Harness Agent)

This package contains a complete, automated setup tailored specifically for **Linux Mint** (and Debian/Ubuntu distributions). It configures the **Antigravity Router** to run silently in the background as a systemd user service every time you turn on your PC, auto-renews your Google OAuth tokens, and provides desktop GUI tools to easily authenticate your account and manage the proxy.

---

## 🤖 Instructions for AI Agents on the Target Machine

If an AI agent is setting up or connecting to this proxy on a remote/local Linux Mint machine:

### 1. Installation Command
```bash
chmod +x setup.sh antigravity-control.sh
./setup.sh
```

### 2. Machine-to-Machine Integration Details
* **OpenAI Compatible Endpoint**: `http://localhost:8045/v1`
* **Chat Completions**: `http://localhost:8045/v1/chat/completions`
* **Claude Messages**: `http://localhost:8045/v1/messages`
* **Gemini Native**: `http://localhost:8045/v1beta/models/{model}:generateContent`
* **Health Check**: `http://localhost:8045/health`
* **Account Credentials Stored At**: `~/.antigravity_tools/accounts/*.json`
* **Server Config Stored At**: `~/.antigravity_tools/gui_config.json`

### 3. Quick Retrieval of API Key via Bash
```bash
jq -r '.proxy.api_key' ~/.antigravity_tools/gui_config.json
```

---

## 📁 What's Included

| File | Purpose |
| :--- | :--- |
| `setup.sh` | **Master installer**: Installs dependencies, sets up the background service, enables autostart on boot, creates desktop shortcuts, and launches the one-time Google login. |
| `antigravity-control.sh` | **Desktop GUI & CLI Control Center**: Native GTK dialogs (`zenity`) to authenticate Google account, view Harness Agent API settings, restart service, and view live logs. |
| `antigravity-router.service` | **Systemd Service Unit**: Ensures the server starts on boot and restarts automatically if terminated. |
| `Antigravity-Proxy-Control.desktop` | **Desktop Launcher**: Double-clickable shortcut for your Linux Mint desktop and Start Menu. |

---

## ⚡ 1-Minute Human Quick Start

1. Open a terminal in this directory:
   ```bash
   chmod +x setup.sh antigravity-control.sh
   ./setup.sh
   ```
2. When prompted by the GUI popup, click **Yes** to open your browser to `http://localhost:8045`.
3. In the browser dashboard, navigate to **Accounts** and click **Login with Google** to attach your Google account with the Antigravity subscription.
4. **Done!** The proxy is now active, persistent across reboots, and ready for Harness Agent.

---

## 🤖 Harness Agent Configuration

In your Harness Agent settings, use the following:

| Setting | Value |
| :--- | :--- |
| **API Provider** | `OpenAI Compatible` (or `Custom Base URL`) |
| **Base URL** | `http://localhost:8045/v1` |
| **API Key** | Your proxy API key (displayed in the GUI Control Center, or found in `~/.antigravity_tools/gui_config.json`) |
| **Default Model** | `gemini-2.5-pro` or `gemini-3-pro-high` |

### Recommended Models:
* `gemini-2.5-pro` (Best all-around reasoning & coding)
* `gemini-3-pro-high` (Highest reasoning tier)
* `gemini-3-flash` (Ultra-fast, low latency)
* `claude-sonnet-4-6` / `claude-3-5-sonnet` (Claude mapping)

---

## 🖥️ Managing the Proxy

### Option A: Graphical Desktop App (Linux Mint GUI)
* Double-click the **Antigravity Proxy Control** icon on your Linux Mint desktop or find it in your Start Menu.
* Key functions:
  * 🔑 **Authenticate Google Account** (OAuth login)
  * 📋 **View Harness Agent API Settings** (Copy Base URL & Key)
  * 🌐 **Open Web Dashboard** (`http://localhost:8045`)
  * 🔄 **Restart / Toggle Server**
  * 📜 **View Live Logs**

### Option B: Terminal Commands
```bash
# Open interactive control menu
antigravity-control

# Check systemd service status
systemctl --user status antigravity-router

# Restart the proxy service
systemctl --user restart antigravity-router

# View live streaming logs
journalctl --user -u antigravity-router -f
```

---

## 🛡️ Autostart Verification

To confirm that autostart is active on boot:
```bash
systemctl --user is-enabled antigravity-router
```
It will output `enabled`. Whenever your computer restarts, the proxy will be online waiting on port `8045` before you even open your terminal or IDE.
