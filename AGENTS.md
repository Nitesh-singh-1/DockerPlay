# DockerPlay AI Agent Directives & Project Rules

All AI agents working in this workspace must abide by the core architecture, layout constraints, and simulation invariants defined here and in [PROJECT_CONTEXT.md](file:///G:/Codes/DockerPlay/PROJECT_CONTEXT.md).

---

## 1. Non-Negotiable Layout & Viewport Invariants

- **Root Viewport Constraint**:
  - `html` & `body` in `src/app/layout.tsx` must retain `h-screen w-screen overflow-hidden flex flex-col`.
  - `<main>` must retain `flex-1 min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col`.
- **Workstation Pages (`/playground`, `/curriculum`, `/break-fix`, `/missions`)**:
  - Parent split containers must specify `h-full min-h-0 overflow-hidden`.
  - **MANDATORY**: Any flex/grid column or container enclosing `DockerTerminal` **MUST have `min-h-0`**. Without `min-h-0`, CSS defaults `min-height: auto`, which causes the terminal console to stretch infinitely downward rather than scrolling internally.
- **Scrollable Pages (`/`, `/dashboard`, `/tools/cheat-sheet`)**:
  - Top-level wrapper must specify `flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden`.
- **Docker Terminal (`DockerTerminal.tsx`)**:
  - Title bar must be single-line across widths `360px` to `1200px` (`whitespace-nowrap truncate`).
  - Output console buffer must be `flex-1 min-h-0 overflow-y-auto`.
  - Command input bar must be `shrink-0`.

---

## 2. Docker Simulation & Runtime Invariants

- **Static Export**: Next.js is configured with `output: 'export'`. Never add server-only Node.js runtime code (`fs`, API routes, server actions).
- **Embedded DNS**:
  - Default `bridge` (`172.17.0.0/16`) does NOT resolve container names via DNS.
  - User-defined bridges (`172.20.0.0/16`) route through embedded DNS `127.0.0.11`.
  - Multi-network containers prioritize user-defined bridge DNS resolution.
- **State Flow**:
  - `CommandParser` ➔ `DockerEngine` ➔ State Mutation ➔ `recordEvent()` ➔ `notify()` ➔ Subscribed React UI Visualizers.

---

## 3. Workspace Agent & Skill Discovery

Custom skills and agent definitions reside in:
- `agent/skills/` (registered via `.agents/skills.json`):
  - `kickoff`: Plan and implement new features, commands, and visualizers.
  - `bugfix`: Diagnose, reproduce, isolate, and fix defects.
  - `planner`: Discuss architecture, formulate design specs (ADRs), coordinate agents.
  - `ui`: Build reactive visualizers, enforce styling and layout invariants.
- `agent/agents/`:
  - `ui.md`: Specialized UI/UX Frontend Engineer.
  - `planner.md`: Systems Architect & Multi-Agent Coordinator.

