# DockerPlay Agent System

Welcome to the **DockerPlay Agent Workspace**. This directory hosts the specialized skills, architectural planning guidelines, and agent personas tailored specifically to the **DockerPlay** codebase — an in-browser Docker learning playground and simulation engine.

---

## 📁 Directory Structure

```text
agent/
├── README.md                # System documentation & agent orchestration guide
├── agents/                  # Specialized autonomous agent personas
│   ├── ui.md                # Specialized UI/UX & Layout Engineer Agent
│   └── planner.md           # Systems Architect & Multi-Agent Planner Agent
└── skills/                  # Actionable step-by-step procedure runbooks
    ├── kickoff/             # Feature inception, scoping, design & development
    │   └── SKILL.md
    ├── bugfix/              # Triage, diagnosis, reproduction & surgical fixes
    │   └── SKILL.md
    ├── planner/             # Architecture debates, RFCs & multi-agent alignment
    │   └── SKILL.md
    └── ui/                  # UI components, layout invariants & visualizers
        └── SKILL.md
```

---

## 🤖 Available Agents & Skills

| Customization | Type | Focus Area | When to Use |
| :--- | :--- | :--- | :--- |
| **`kickoff`** | Skill | Feature Planning & Development | Starting any new feature, command, visualizer, or challenge quest |
| **`bugfix`** | Skill | Defect Resolution & Triage | Diagnosing and fixing parser, engine, layout, or state bugs |
| **`planner`** | Skill & Agent | Architecture & Multi-Agent Debate | Formulating RFCs, designing complex state systems, evaluating trade-offs |
| **`ui`** | Skill & Agent | React 19, Tailwind, Layout & Animation | Building visualizers, terminal styling, fixing viewport/sizing invariants |

---

## 🏛️ Core Codebase Invariants (Must Respect)

Every agent and skill operating in this codebase MUST uphold these core rules:

1. **Root Viewport Constraint**:
   - `html` & `body` in `src/app/layout.tsx` have `h-screen w-screen overflow-hidden flex flex-col`.
   - `<main>` has `flex-1 min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col`.
2. **Workstation Pages (`/playground`, `/curriculum`, `/break-fix`, `/missions`)**:
   - Must use `h-full min-h-0 overflow-hidden` on parent split containers.
   - Grid and flex columns holding `DockerTerminal` **MUST specify `min-h-0`** to avoid default `min-height: auto` downward stretching.
3. **Scrollable Document Pages (`/`, `/dashboard`, `/tools/cheat-sheet`)**:
   - Top-level wrapper must specify `flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden`.
4. **Terminal Component Standards (`DockerTerminal.tsx`)**:
   - Header must remain single-line across widths (`360px` to `1200px`) with `whitespace-nowrap truncate`.
   - Output buffer must use `flex-1 min-h-0 overflow-y-auto`.
   - Input line must be `shrink-0` at the bottom.
5. **Simulated Runtime Semantics**:
   - Client-side static export (`output: 'export'`) with zero server dependency.
   - Pure TypeScript state machine (`DockerEngine.ts`) with strict command parsing (`CommandParser.ts`).
   - Default bridge (`172.17.0.0/16`) has no container DNS resolution; user-defined bridges (`172.20.0.0/16`) route through embedded DNS `127.0.0.11`.

