# 🐳 DockerPlay — Interactive Docker Learning Playground

> **Learn → Visualize → Execute → Observe → Break → Fix → Test**

A modern, beginner-friendly, visual **Docker Learning Playground** built to teach Docker through hands-on practice, visual mental models, and real terminal execution directly in your browser.

**Zero Docker Desktop Installation Required** — Powered by a deterministic, client-side Docker Simulation Engine (`DockerEngine`).

---

## 🌟 Key Features

### 1. 🖥️ Interactive CLI Terminal & Command Explainer
- **Realistic CLI Lexer & AST Parser**: Supports flags (`-d`, `-it`, `-p`, `-v`, `-e`, `--name`, `--network`, `--rm`, `--restart`, `--memory`), multi-stage commands, and short/long options.
- **"What Just Happened?" Explanations**: Generates step-by-step educational breakdowns after every command execution.
- **1-Click "⚡ Run in Terminal"**: One-click execution chips across all lessons, exercises, and reference cheat sheets.
- **Beginner Mode Flag Annotations**: Real-time flag hints as you type.

### 2. 🎨 Six Specialized Visualizers
- **Topology & Cluster Canvas**: Live interactive map of host boundaries, Docker daemon (`dockerd`), active container nodes with CPU/RAM gauge bars, bridge networks, and volume mounts.
- **Network Flow & DNS Visualizer**: Step-by-step animated packet tracer demonstrating embedded DNS resolution (`127.0.0.11`) and why `localhost` between containers fails.
- **Port NAT Bridge Visualizer**: Interactive host-to-container port translation bridge (`localhost:HOST_PORT` $\rightarrow$ `Container:PORT`).
- **Image Layer Stack & Build Cache**: Layer cake visualization showing layer sizes and cache hits (`CACHED` vs `REBUILT`).
- **Docker Compose 3-Tier Studio**: Multi-tier architecture visualizer linking Frontend, API backend, and PostgreSQL database with `docker compose up -d`.
- **Container Explorer**: Docker Desktop-style container table with start, stop, restart, and delete lifecycle controls.

### 3. 📚 Structured Curriculum & Hands-on Quests
- **10 Core Curriculum Chapters + Kubernetes Bridge**:
  1. *What is Docker? (Containers vs VMs)*
  2. *Docker Images & Layers*
  3. *Container Lifecycle & Management*
  4. *Mastering `docker run` Flags*
  5. *Ports & Port Publishing*
  6. *Container Networking & Embedded DNS*
  7. *Volumes & Data Persistence*
  8. *Writing Dockerfiles & Build Cache Optimization*
  9. *Docker Compose Multi-Container Orchestration*
  10. *Debugging & Troubleshooting Containers*
  *Bonus: Bridge to Kubernetes (Pods, Services, Deployments)*
- **10 Progressive Missions**: Progressive challenges with automated verification.
- **5 Break/Fix Troubleshooting Scenarios**: Crash Loops (Exit 1), Port Mismatches, Network Splits, Lost DB State, and Port Collisions.
- **MCQ Quiz Engine**: Scoring, confetti animations, and detailed explanation keys.
- **Searchable Cheat Sheet**: Categorized reference library for Docker CLI commands.

### 4. 🎨 Multi-Theme Brand System
- ☀️ **Clean Sky Blue**: Clean light mode with crisp white cards and sky blue accents for strain-free reading.
- 🔵🔴🟡🟢 **Google Tech**: Google Cloud Blue (`#1a73e8`) and Google 4-color accents.
- 💬 **WhatsApp Green**: WhatsApp Emerald (`#25D366`) and Teal (`#128C7E`).
- 🔷 **Meta Royal Blue**: Meta / Facebook signature blue (`#0866FF`).
- 🌙 **Midnight Studio**: Deep obsidian dark mode.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom CSS Variable Design System
- **Typography**: [Google Fonts](https://fonts.google.com/) (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Nitesh-singh-1/DockerPlay.git

# Navigate into project directory
cd DockerPlay

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 👨‍💻 Author & Creator

**Nitesh Singh**
- **GitHub**: [@Nitesh-singh-1](https://github.com/Nitesh-singh-1)
- **Repository**: [https://github.com/Nitesh-singh-1/DockerPlay](https://github.com/Nitesh-singh-1/DockerPlay)
- **Live Platform**: [https://dockerplay.org](https://dockerplay.org) *(Mirror: [https://dockerplay-dd370.web.app/](https://dockerplay-dd370.web.app/))*

### 💡 Engineering & Architectural Highlights (Resume Portfolio):
- **Custom Docker CLI Lexer & AST Parser**: Engineered a robust tokenizer capable of parsing Unix command syntax, quote escaping, subcommands, flag normalization (`-d`, `-it`, `-v`, `-p`, `-e`), and Levenshtein fuzzy error suggestions.
- **In-Browser Docker Runtime State Machine**: Simulates realistic container states (`created`, `running`, `paused`, `restarting`, `exited`), layer caches, persistent volume mounts, and network namespaces without server-side compute.
- **Embedded DNS & Virtual Network Flow Visualizer**: Implemented realistic `127.0.0.11` DNS service discovery across user-defined bridge networks with step-by-step packet trace animation.
- **Next.js 15 & Modern UI System**: Built with React 19, TypeScript, and a CSS-variable design system supporting 5 custom brand palettes and dark mode.

---

## 📄 License

MIT License — Created & Maintained by **Nitesh Singh**. Feel free to use, modify, and star the repository!
