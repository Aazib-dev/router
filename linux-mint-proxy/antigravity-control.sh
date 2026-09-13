#!/usr/bin/env bash
# ==============================================================================
# Antigravity Router - Linux Mint GUI & CLI Control Center
# ==============================================================================

set -euo pipefail

PORT="${PORT:-8045}"
BASE_URL="http://127.0.0.1:${PORT}"
API_URL="${BASE_URL}/v1"
CONFIG_FILE="${HOME}/.antigravity_tools/gui_config.json"
SERVICE_NAME="antigravity-router.service"

# Detect if running under graphical display
has_gui() {
    [[ -n "${DISPLAY:-}" || -n "${WAYLAND_DISPLAY:-}" ]] && command -v zenity &>/dev/null
}

# Helper to read current API key from config file
get_api_key() {
    if [[ -f "$CONFIG_FILE" ]] && command -v jq &>/dev/null; then
        local key
        key=$(jq -r '.proxy.api_key // empty' "$CONFIG_FILE" 2>/dev/null)
        if [[ -n "$key" && "$key" != "null" ]]; then
            echo "$key"
            return
        fi
    fi
    echo "Check ~/.antigravity_tools/gui_config.json or Web UI"
}

# Helper to check service status
is_service_active() {
    systemctl --user is-active --quiet "$SERVICE_NAME" 2>/dev/null
}

# Helper to check health endpoint
check_health() {
    if curl -s -m 2 "${BASE_URL}/health" &>/dev/null; then
        echo "Healthy (Responding)"
    elif is_service_active; then
        echo "Starting up (HTTP not ready yet)"
    else
        echo "Stopped"
    fi
}

# Action 1: Authenticate Google Account
action_auth() {
    local auth_url="${BASE_URL}/"
    if has_gui; then
        zenity --info --title="Authenticate Google Account" --width=450 \
            --text="The proxy management dashboard will open in your browser.\n\n1. Go to 'Accounts' (or click Add Account)\n2. Click 'Login with Google' / 'OAuth'\n3. Authorize with your Antigravity Google account\n\nOnce done, the tokens are saved automatically!" 2>/dev/null || true
    else
        echo ""
        echo "--------------------------------------------------------"
        echo "1. Go to 'Accounts' in the Web Dashboard."
        echo "2. Click 'Login with Google' (OAuth)."
        echo "3. Authorize with your Google Antigravity account."
        echo "Tokens will be saved automatically to ~/.antigravity_tools/accounts"
        echo "--------------------------------------------------------"
    fi

    if command -v xdg-open &>/dev/null; then
        xdg-open "$auth_url" &>/dev/null || true
    fi
}

# Action 2: Open Web Dashboard
action_dashboard() {
    if command -v xdg-open &>/dev/null; then
        xdg-open "${BASE_URL}" &>/dev/null || true
    else
        echo "Open your browser at: ${BASE_URL}"
    fi
}

# Action 3: Launch Native Desktop GUI Window
action_desktop_gui() {
    local bin_path
    bin_path=$(command -v antigravity-tools || command -v router || echo "")
    if [[ -z "$bin_path" ]]; then
        if [[ -f "/usr/bin/antigravity-tools" ]]; then
            bin_path="/usr/bin/antigravity-tools"
        elif [[ -f "${HOME}/.local/bin/antigravity-tools" ]]; then
            bin_path="${HOME}/.local/bin/antigravity-tools"
        fi
    fi

    if [[ -n "$bin_path" && -x "$bin_path" ]]; then
        # If the background service is running on 8045, warn the user
        if is_service_active && has_gui; then
            zenity --question --title="Background Service Running" --width=420 \
                --text="The background headless service is already running on port ${PORT}.\nLaunching the full desktop app will connect to the same accounts.\n\nDo you want to continue?" 2>/dev/null || return
        fi
        nohup "$bin_path" >/dev/null 2>&1 &
    else
        if has_gui; then
            zenity --error --title="Binary Not Found" --text="Could not find antigravity-tools binary.\nPlease run setup.sh first." 2>/dev/null || true
        else
            echo "Error: antigravity-tools executable not found. Please run setup.sh first."
        fi
    fi
}

# Action 4: Display Harness Agent API Configuration
action_harness_config() {
    local api_key
    api_key=$(get_api_key)
    local status
    status=$(check_health)

    local info_text="==================================================
🤖 HARNESS AGENT INTEGRATION CONFIGURATION
==================================================

• Status:          ${status}
• Base URL:        ${API_URL}
• Fallback URL:    ${BASE_URL}
• API Key:         ${api_key}

Supported Model Names (drop-in):
  - gemini-2.5-pro
  - gemini-3-pro-high
  - gemini-3-flash
  - claude-sonnet-4-6
  - claude-3-5-sonnet

Harness Agent Settings:
  Set 'OpenAI Base URL' -> ${API_URL}
  Set 'API Key'         -> ${api_key}
=================================================="

    if has_gui; then
        zenity --info --title="Harness Agent Configuration" --width=520 --height=380 \
            --text="$info_text" 2>/dev/null || true
    else
        echo "$info_text"
        echo ""
        read -rp "Press Enter to continue..."
    fi
}

# Action 5: Service Management
action_service_toggle() {
    if is_service_active; then
        systemctl --user stop "$SERVICE_NAME"
        local msg="Service stopped."
    else
        systemctl --user start "$SERVICE_NAME"
        local msg="Service started."
    fi

    if has_gui; then
        zenity --info --title="Service Status" --text="$msg" 2>/dev/null || true
    else
        echo "$msg"
    fi
}

action_service_restart() {
    systemctl --user restart "$SERVICE_NAME"
    if has_gui; then
        zenity --info --title="Service Restart" --text="Antigravity Router service restarted." 2>/dev/null || true
    else
        echo "Antigravity Router service restarted."
    fi
}

# Action 6: View Logs
action_view_logs() {
    local logs
    logs=$(journalctl --user -u "$SERVICE_NAME" -n 50 --no-pager 2>&1 || echo "No logs found.")
    if has_gui; then
        echo "$logs" | zenity --text-info --title="Service Logs (Last 50 Lines)" --width=700 --height=500 2>/dev/null || true
    else
        echo "--- Antigravity Router Logs ---"
        echo "$logs"
        echo "-------------------------------"
        read -rp "Press Enter to continue..."
    fi
}

# GUI Menu Loop (using Zenity)
gui_menu() {
    while true; do
        local status
        status=$(check_health)
        local choice
        choice=$(zenity --list --title="Antigravity Proxy Control Center" \
            --text="Status: <b>${status}</b> | Port: <b>${PORT}</b>\nSelect an action:" \
            --column="Key" --column="Action" --column="Description" \
            --hide-column=1 \
            --height=400 --width=600 \
            "AUTH" "🔑 Authenticate Google Account" "Open Web UI to log into Google / Antigravity" \
            "CONFIG" "📋 Harness Agent API Settings" "View Base URL, API Key, and model names" \
            "WEB" "🌐 Open Web Dashboard" "Open browser interface (accounts, quota, routing)" \
            "APP" "🖥️ Launch Native Desktop Window" "Open full graphical desktop app" \
            "RESTART" "🔄 Restart Server" "Restart background systemd service" \
            "TOGGLE" "⏯️ Start / Stop Server" "Toggle background service on/off" \
            "LOGS" "📜 View Server Logs" "Inspect recent journal logs" \
            "EXIT" "❌ Exit" "Close Control Center" \
            2>/dev/null || echo "EXIT")

        case "$choice" in
            "AUTH") action_auth ;;
            "CONFIG") action_harness_config ;;
            "WEB") action_dashboard ;;
            "APP") action_desktop_gui ;;
            "RESTART") action_service_restart ;;
            "TOGGLE") action_service_toggle ;;
            "LOGS") action_view_logs ;;
            *) break ;;
        esac
    done
}

# CLI Menu Loop (fallback if no GUI)
cli_menu() {
    while true; do
        local status
        status=$(check_health)
        echo ""
        echo "=================================================="
        echo "       Antigravity Proxy Control Center"
        echo "=================================================="
        echo " Status: ${status} | Port: ${PORT}"
        echo "--------------------------------------------------"
        echo " 1) 🔑 Authenticate Google Account"
        echo " 2) 📋 View Harness Agent API Settings"
        echo " 3) 🌐 Open Web Dashboard"
        echo " 4) 🖥️  Launch Native Desktop Window"
        echo " 5) 🔄 Restart Service"
        echo " 6) ⏯️  Start / Stop Service"
        echo " 7) 📜 View Server Logs"
        echo " 8) ❌ Exit"
        echo "--------------------------------------------------"
        read -rp "Select an option [1-8]: " opt
        case "$opt" in
            1) action_auth ;;
            2) action_harness_config ;;
            3) action_dashboard ;;
            4) action_desktop_gui ;;
            5) action_service_restart ;;
            6) action_service_toggle ;;
            7) action_view_logs ;;
            8) echo "Goodbye!"; exit 0 ;;
            *) echo "Invalid option, please try again." ;;
        esac
    done
}

# Main Entry
main() {
    if has_gui; then
        gui_menu
    else
        cli_menu
    fi
}

main "$@"
