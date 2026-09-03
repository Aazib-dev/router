# Router 🚀

High-performance AI account management gateway and protocol proxy built with Tauri v2, React 19, and Rust.

## Features

- **Multi-Account Management**: Manage multiple AI accounts with real-time health checks, quota monitoring, and automatic failover.
- **Protocol Proxying**:
  - **OpenAI Compatible**: `/v1/chat/completions` endpoint compatible with existing AI tools and SDKs.
  - **Anthropic Compatible**: Native `/v1/messages` endpoint supporting Claude Code CLI and tool use.
  - **Gemini Native**: Direct compatibility with Google Gemini models.
- **Smart Model Routing**: Configurable rules to map incoming model IDs to target accounts and models based on availability and quotas.
- **Quota Protection & Auto-Retry**: Automatic failover on rate limits (429) or token expiration (401).
- **Fast Desktop Client**: Lightweight, cross-platform desktop app powered by Tauri v2 and Vite.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Zustand
- **Desktop Runtime**: Tauri v2
- **Backend & Proxy**: Rust (Axum, Hyper, Reqwest, Tokio, Rusqlite)

## Development Setup

### Prerequisites

- Node.js (v18+) & npm / pnpm
- Rust toolchain (`rustup`, `cargo`)
- Tauri v2 prerequisites for your OS

### Installation

`ash
# Install frontend dependencies
npm install

# Run Vite dev server
npm run dev

# Run Tauri desktop app in debug mode
npm run tauri:debug
`

### Build

`ash
# Build frontend
npm run build

# Build desktop release package
npm run tauri build
`

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](./LICENSE).
