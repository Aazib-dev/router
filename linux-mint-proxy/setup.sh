#!/usr/bin/env bash
# ==============================================================================
# Antigravity Router - One-Click Installer & Autostart Setup for Linux Mint
# ==============================================================================

set -euo pipefail

# Visual styling
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="Aazib-dev/router"
APP_NAME="Antigravity Tools"
PORT=8045
SERVICE_NAME="antigravity-router.service"

echo ""
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}    Antigravity Router - Linux Mint Setup & Autostart ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

# 1. OS & Architecture Check
OS="$(uname -s)"
ARCH="$(uname -m)"

if [[ "$OS" != "Linux" ]]; then
    error "This script is tailored for Linux Mint / Debian / Ubuntu. Detected: $OS"
fi

case "$ARCH" in
    x86_64|amd64)  DEB_ARCH="amd64" ;;
    aarch64|arm64) DEB_ARCH="arm64" ;;
    *)             error "Unsupported CPU architecture: $ARCH" ;;
esac

info "Detected Linux architecture: ${DEB_ARCH}"

# 2. Check and install dependencies
info "Checking required system dependencies..."
DEPENDENCIES=("curl" "jq" "zenity" "xdg-utils" "libayatana-appindicator3-1")
MISSING_DEPS=()

for dep in "${DEPENDENCIES[@]}"; do
    if ! dpkg -s "$dep" &>/dev/null; then
        MISSING_DEPS+=("$dep")
    fi
done

if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
    info "Installing missing dependencies: ${MISSING_DEPS[*]} (sudo required)..."
    sudo apt-get update -y
    # Use -f install if appindicator package name variant differs
    sudo apt-get install -y "${MISSING_DEPS[@]}" || sudo apt-get install -y curl jq zenity xdg-utils
    success "System dependencies installed."
else
    success "All system dependencies are already installed."
fi

# 3. Locate or Install Antigravity Router binary
BINARY_PATH=""
if command -v antigravity-tools &>/dev/null; then
    BINARY_PATH="$(command -v antigravity-tools)"
elif command -v router &>/dev/null; then
    BINARY_PATH="$(command -v router)"
elif [[ -f "/usr/bin/antigravity-tools" ]]; then
    BINARY_PATH="/usr/bin/antigravity-tools"
elif [[ -f "${HOME}/.local/bin/antigravity-tools" ]]; then
    BINARY_PATH="${HOME}/.local/bin/antigravity-tools"
fi

if [[ -z "$BINARY_PATH" ]]; then
    info "Antigravity Router is not yet installed. Looking for installation package..."
    
    # Check if a .deb file is present in current or parent folder
    LOCAL_DEB=$(find "$SCRIPT_DIR" "$SCRIPT_DIR/.." -maxdepth 2 -name "*.deb" 2>/dev/null | head -n1 || true)
    
    if [[ -n "$LOCAL_DEB" && -f "$LOCAL_DEB" ]]; then
        info "Found local installer: $LOCAL_DEB"
        sudo dpkg -i "$LOCAL_DEB"
        sudo apt-get install -f -y
    else
        info "Fetching latest release from GitHub (${REPO})..."
        API_URL="https://api.github.com/repos/${REPO}/releases/latest"
        LATEST_VERSION=$(curl -fsSL --max-time 10 "$API_URL" 2>/dev/null | grep '"tag_name"' | head -n1 | sed -E 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v?([^"]+)".*/\1/' || echo "")
        
        if [[ -z "$LATEST_VERSION" ]]; then
            warn "Could not fetch release tag from GitHub API, checking releases URL..."
            LATEST_VERSION="4.3.0"
        fi
        
        DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${LATEST_VERSION}/Antigravity.Tools_${LATEST_VERSION}_${DEB_ARCH}.deb"
        TEMP_DEB="$(mktemp /tmp/antigravity_tools_XXXXXX.deb)"
        
        info "Downloading ${DOWNLOAD_URL}..."
        if curl -fSL --progress-bar -o "$TEMP_DEB" "$DOWNLOAD_URL"; then
            info "Installing Antigravity Tools..."
            sudo dpkg -i "$TEMP_DEB" || sudo apt-get install -f -y
            rm -f "$TEMP_DEB"
        else
            rm -f "$TEMP_DEB"
            # Fallback: check if install.sh exists in antigravity-manager
            if [[ -f "$SCRIPT_DIR/../antigravity-manager/install.sh" ]]; then
                info "Running project install.sh..."
                bash "$SCRIPT_DIR/../antigravity-manager/install.sh"
            else
                error "Failed to download .deb package. Please download and install Antigravity Tools .deb manually, then rerun setup.sh."
            fi
        fi
    fi

    # Re-check binary path
    if command -v antigravity-tools &>/dev/null; then
        BINARY_PATH="$(command -v antigravity-tools)"
    elif [[ -f "/usr/bin/antigravity-tools" ]]; then
        BINARY_PATH="/usr/bin/antigravity-tools"
    elif [[ -f "${HOME}/.local/bin/antigravity-tools" ]]; then
        BINARY_PATH="${HOME}/.local/bin/antigravity-tools"
    else
        error "Antigravity Tools was installed, but executable 'antigravity-tools' could not be located."
    fi
fi

success "Located Antigravity Tools executable: ${BINARY_PATH}"

# 4. Create Service Runner script in ~/.local/bin
mkdir -p "${HOME}/.local/bin"

RUNNER_SCRIPT="${HOME}/.local/bin/antigravity-service-runner"
cat << EOF > "$RUNNER_SCRIPT"
#!/usr/bin/env bash
# Headless runner for Antigravity Router Systemd Service
export PORT="${PORT}"
export LOG_LEVEL="info"
export ABV_BIND_LOCAL_ONLY="1"

exec "${BINARY_PATH}" --headless
EOF

chmod +x "$RUNNER_SCRIPT"
success "Created runner script: ${RUNNER_SCRIPT}"

# 5. Install the GUI & CLI Control Center script
CONTROL_SCRIPT="${HOME}/.local/bin/antigravity-control"
if [[ -f "$SCRIPT_DIR/antigravity-control.sh" ]]; then
    cp "$SCRIPT_DIR/antigravity-control.sh" "$CONTROL_SCRIPT"
    chmod +x "$CONTROL_SCRIPT"
    success "Installed Control Center script to: ${CONTROL_SCRIPT}"
fi

# Ensure ~/.local/bin is on PATH in .bashrc if not already present
if [[ ":$PATH:" != *":${HOME}/.local/bin:"* ]]; then
    if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "${HOME}/.bashrc" 2>/dev/null; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${HOME}/.bashrc"
        info "Added ~/.local/bin to ~/.bashrc"
    fi
fi

# 6. Configure and Enable Systemd User Service (Autostart on Boot)
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"
mkdir -p "$SYSTEMD_USER_DIR"

if [[ -f "$SCRIPT_DIR/antigravity-router.service" ]]; then
    cp "$SCRIPT_DIR/antigravity-router.service" "${SYSTEMD_USER_DIR}/${SERVICE_NAME}"
else
    cat << EOF > "${SYSTEMD_USER_DIR}/${SERVICE_NAME}"
[Unit]
Description=Antigravity Router & AI Gateway Service
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=${RUNNER_SCRIPT}
Restart=on-failure
RestartSec=5s
Environment=PORT=${PORT}
Environment=LOG_LEVEL=info
Environment=ABV_BIND_LOCAL_ONLY=1

[Install]
WantedBy=default.target
EOF
fi

info "Reloading systemd user daemon..."
systemctl --user daemon-reload
systemctl --user enable --now "$SERVICE_NAME"

# Enable linger so service starts on boot even before graphical desktop login
loginctl enable-linger "$USER" 2>/dev/null || true
success "Systemd user service enabled and started!"

# 7. Install Desktop Shortcuts & Application Menu entries
mkdir -p "${HOME}/Desktop"
mkdir -p "${HOME}/.local/share/applications"

DESKTOP_SRC="$SCRIPT_DIR/Antigravity-Proxy-Control.desktop"
if [[ -f "$DESKTOP_SRC" ]]; then
    cp "$DESKTOP_SRC" "${HOME}/Desktop/Antigravity-Proxy-Control.desktop"
    cp "$DESKTOP_SRC" "${HOME}/.local/share/applications/Antigravity-Proxy-Control.desktop"
    
    # Replace Exec with absolute path to control script
    sed -i "s|Exec=antigravity-control|Exec=${CONTROL_SCRIPT}|g" "${HOME}/Desktop/Antigravity-Proxy-Control.desktop"
    sed -i "s|Exec=antigravity-control|Exec=${CONTROL_SCRIPT}|g" "${HOME}/.local/share/applications/Antigravity-Proxy-Control.desktop"
    
    chmod +x "${HOME}/Desktop/Antigravity-Proxy-Control.desktop"
    # Mark as trusted on Linux Mint Cinnamon desktop
    gio set "${HOME}/Desktop/Antigravity-Proxy-Control.desktop" metadata::trusted true 2>/dev/null || true
    
    success "Desktop shortcut created: ~/Desktop/Antigravity-Proxy-Control.desktop"
    success "Application menu entry created."
fi

# 8. Verify service health
info "Waiting for proxy server to respond on http://localhost:${PORT}/health..."
MAX_WAIT=10
READY=false

for ((i=1; i<=MAX_WAIT; i++)); do
    if curl -s -m 1 "http://localhost:${PORT}/health" &>/dev/null; then
        READY=true
        break
    fi
    sleep 1
done

if [[ "$READY" == "true" ]]; then
    success "Antigravity Router is active and responding on port ${PORT}!"
else
    warn "Server did not respond immediately. It may still be initializing. Checking systemctl status:"
    systemctl --user status "$SERVICE_NAME" --no-pager || true
fi

# 9. Extract API Key if available
CONFIG_FILE="${HOME}/.antigravity_tools/gui_config.json"
API_KEY="Check Web UI or set custom key"
if [[ -f "$CONFIG_FILE" ]] && command -v jq &>/dev/null; then
    FOUND_KEY=$(jq -r '.proxy.api_key // empty' "$CONFIG_FILE" 2>/dev/null || true)
    if [[ -n "$FOUND_KEY" && "$FOUND_KEY" != "null" ]]; then
        API_KEY="$FOUND_KEY"
    fi
fi

# 10. Summary & Interactive Google Authentication
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}       🎉 Antigravity Router Setup Completed Successfully!       ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "  • ${BLUE}Autostart Status${NC}:  Runs automatically on boot (systemd user service)"
echo -e "  • ${BLUE}Dashboard URL${NC}:     http://localhost:${PORT}"
echo -e "  • ${BLUE}Harness Base URL${NC}:  http://localhost:${PORT}/v1"
echo -e "  • ${BLUE}Proxy API Key${NC}:     ${API_KEY}"
echo -e "  • ${BLUE}Desktop Tool${NC}:      Double-click 'Antigravity Proxy Control' on your desktop"
echo -e "  • ${BLUE}Terminal Command${NC}:  Run 'antigravity-control' anytime"
echo ""

# GUI Prompt for Google Authentication
if [[ -n "${DISPLAY:-}" || -n "${WAYLAND_DISPLAY:-}" ]] && command -v zenity &>/dev/null; then
    if zenity --question --title="Authenticate Google Account" --width=480 \
        --text="<b>Antigravity Proxy is now running!</b>\n\nTo connect your Antigravity subscription, you need to log in to your Google Account once.\n\nWould you like to open the authentication page in your browser now?" 2>/dev/null; then
        xdg-open "http://localhost:${PORT}/" &>/dev/null || true
    fi

    # Display Harness Agent Config Dialog
    zenity --info --title="Harness Agent API Ready" --width=500 --height=320 \
        --text="<b>Configure Harness Agent with these settings:</b>\n\n• <b>OpenAI Base URL:</b> http://localhost:${PORT}/v1\n• <b>API Key:</b> ${API_KEY}\n• <b>Supported Models:</b> gemini-2.5-pro, gemini-3-pro-high, gemini-3-flash, claude-sonnet-4-6\n\nYou can launch <b>Antigravity Proxy Control</b> anytime from your desktop or start menu!" 2>/dev/null || true
else
    echo "To authenticate your Google account:"
    echo "  1. Open http://localhost:${PORT}/ in your browser."
    echo "  2. Go to 'Accounts' -> 'Login with Google' (OAuth)."
    echo "  3. Log in with your account that has the Antigravity subscription."
    echo ""
    echo "After that, enter http://localhost:${PORT}/v1 and your API key in Harness Agent!"
fi

echo ""
success "Setup complete! Enjoy building with Harness Agent!"
