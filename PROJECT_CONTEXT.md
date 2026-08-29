# DockerPlay — Architecture, State & Component Context Matrix

> **Core Purpose**: Visual, interactive in-browser Docker learning playground & simulator. Zero Docker Desktop required.
> **Architect & Creator**: Nitesh Singh ([@Nitesh-singh-1](https://github.com/Nitesh-singh-1))
> **Live Web App**: [https://dockerplay-dd370.web.app/](https://dockerplay-dd370.web.app/)

---

## 1. Directory & System Map

```
src/
├── app/
│   ├── layout.tsx              # Root HTML/Body wrapper (h-screen overflow-hidden viewport lock)
│   ├── page.tsx                # Landing page (vertical scroll enabled)
│   ├── dashboard/              # User XP, Streak & Badges profile
│   ├── playground/             # 12-col split visualizer + terminal workstation
│   ├── curriculum/[chapterId]/ # 11-chapter curriculum road + interactive terminal
│   ├── missions/               # Hands-on challenge quests
│   ├── break-fix/              # Production incident break/fix troubleshooting labs
│   └── tools/
│       ├── cheat-sheet/        # Quick Docker command reference
│       ├── compose-studio/     # Multi-tier compose orchestration
│       └── network-visualizer/ # Standalone network bridge debugger
├── components/
│   ├── terminal/
│   │   └── DockerTerminal.tsx  # In-browser CLI console, auto-scroll, chips, error cards
│   ├── visualizer/
│   │   ├── ArchitectureCanvas.tsx      # Interactive topology & Docker daemon visualizer
│   │   ├── NetworkFlowVisualizer.tsx   # Packet tracer, DNS 127.0.0.11 & bridge routes
│   │   ├── PortBridgeVisualizer.tsx    # Host-to-container port mapping visualizer
│   │   ├── ImageLayerVisualizer.tsx    # Immutable layer stack & cache diff
│   │   └── ComposeTopologyVisualizer.tsx # 3-tier compose dependency visualizer
│   ├── curriculum/
│   │   ├── ChapterView.tsx             # 3-pane curriculum lesson viewer
│   │   ├── QuizModal.tsx               # Chapter knowledge check MCQ modals
│   │   └── InteractiveExercise.tsx     # Guided mission validation checkpoints
│   └── monetization/
│       ├── GoogleAdSense.tsx           # Auto-ads script injection (ca-pub-3059241515168098)
│       └── AdBanner.tsx                # Safe in-feed display ad components
└── lib/
    ├── parser/
    │   ├── CommandParser.ts            # Strict AST parser, command validation, fuzzy hints
    │   ├── ShellTokenizer.ts           # Shell tokenization (quotes, escapes, flags)
    │   ├── DockerFlagDefinitions.ts    # Flag schemas, aliases, and Levenshtein matcher
    │   └── DockerNames.ts              # Authentic random container names (e.g. focused_tesla)
    └── simulator/
        ├── DockerEngine.ts             # State machine (containers, volumes, networks, DNS)
        └── DefaultImages.ts            # Pre-seeded image registries & layers
```

---

## 2. Global Layout & Sizing Invariants

1. **Root Viewport Constraint**:
   - `html` & `body` in `src/app/layout.tsx` have `h-screen w-screen overflow-hidden flex flex-col`.
   - `<main>` has `flex-1 min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col`.
2. **Workstation Pages (`/playground`, `/curriculum`, `/break-fix`, `/missions`)**:
   - Must use `h-full min-h-0 overflow-hidden` on parent split containers.
   - Grid and flex columns holding `DockerTerminal` MUST specify `min-h-0` to avoid default `min-height: auto` downward stretching.
3. **Scrollable Document Pages (`/`, `/dashboard`, `/tools/cheat-sheet`)**:
   - Top-level wrapper must specify `flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden`.

---

## 3. Terminal Component (`DockerTerminal.tsx`) Standards

- **Header / Title Bar**:
  - Must remain compact and single-line across all container widths (`360px` to `1200px`).
  - Title text: `Docker Terminal` with `whitespace-nowrap truncate`.
  - Buttons: Compact icon + optional responsive label with tooltips to prevent wrapping or clutter in sidebar layouts.
- **Output Console Buffer**:
  - Must use `flex-1 min-h-0 overflow-y-auto` so commands scroll internally without pushing parent layout.
- **Input Line**:
  - Fixed `shrink-0` at bottom of terminal card.

---

## 4. Docker Simulator & Networking Invariants

- **Default `bridge` (`172.17.0.0/16`)**:
  - Container-to-container communication by container name is disabled by Docker design.
  - Direct IP communication succeeds.
- **User-Defined Bridge (e.g. `app-net`)**:
  - Embedded DNS server (`127.0.0.11`) automatically resolves container names (e.g. `api` ➔ `172.20.0.2`).
  - Multi-network containers: When a container is on both `bridge` and `app-net`, the engine **always prioritizes user-defined networks** for DNS resolution.
- **Host vs Container Execution**:
  - Raw Linux utilities (`ping`, `curl`, `nc`, `cat`, `ls`) typed directly into host Docker CLI produce educational guidance pointing to `docker exec <container> <cmd>`.

---

## 5. Deployment & Production Configurations

- **Static Export**: Next.js configured with `output: 'export'` and `trailingSlash: true`.
- **Firebase Hosting Target**: `dockerplay-dd370.web.app`.
- **AdSense Publisher ID**: `ca-pub-3059241515168098` via `public/ads.txt` and `GoogleAdSense.tsx`.
- **Git Branch**: `main` on `https://github.com/Nitesh-singh-1/DockerPlay.git`.
