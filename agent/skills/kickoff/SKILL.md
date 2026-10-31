---
name: kickoff
description: >-
  Plan, architect, and implement new features for DockerPlay. Use this skill when initiating
  new Docker CLI commands, visualizer components, curriculum chapters, break-fix labs,
  or workstation tools.
---

# Feature Kickoff & Development Workflow

This skill outlines the standard operational procedure for scoping, designing, and delivering new capabilities into the **DockerPlay** interactive playground.

---

## Phase 1: Feature Scoping & Classification

Before writing code, classify the new feature into one or more system domains:

1. **CLI / Command Extension**:
   - Adding or expanding a Docker command (e.g. `docker volume create`, `docker stats`, `docker exec`, `docker compose restart`).
   - Requires updating the parser, flag schema, and command dictionary.
2. **Simulator Engine Feature**:
   - Expanding the state machine (e.g. multi-stage image builds, volume drivers, custom network topologies, process resource metrics).
   - Located in `src/lib/simulator/DockerEngine.ts` and `src/types/docker.ts`.
3. **Visualizer / Workstation UI**:
   - Adding a new visual canvas or topology diagram (e.g. Swarm visualizer, Volume inspector, Port mapping graph).
   - Located in `src/components/visualizer/` and integrated into `/playground` or `/tools`.
4. **Curriculum / Mission Quest**:
   - Authoring an interactive educational lesson or incident scenario.
   - Located in `src/data/curriculum.ts`, `src/data/missions.ts`, or `src/data/troubleshooting.ts`.

---

## Phase 2: Architecture & Multi-Agent Collaboration

For medium-to-large features, invoke or align with specialized agents before coding:

- **Consult `planner`**:
  - Request an architectural review if introducing new state models, changing event structures, or refactoring the simulation loop.
- **Consult `ui` agent**:
  - Review component design, framer-motion animations, responsive split layout rules, and terminal sizing invariants.

---

## Phase 3: Step-by-Step Implementation Sequence

Follow this dependency order to ensure type safety and avoid regressions:

### 1. Type Definitions (`src/types/`)
- Define all new data structures in [src/types/docker.ts](file:///G:/Codes/DockerPlay/src/types/docker.ts) or [src/types/parser.ts](file:///G:/Codes/DockerPlay/src/types/parser.ts).
- Ensure strict TypeScript types (avoid `any`).
- Add appropriate `DockerEvent` action types for state audit logging.

### 2. Command Tokenization & Parsing (`src/lib/parser/`)
- Register supported flags in [DockerFlagDefinitions.ts](file:///G:/Codes/DockerPlay/src/lib/parser/DockerFlagDefinitions.ts).
  - Include aliases (e.g. `-p` and `--publish`, `-v` and `--volume`).
  - Configure whether the flag expects a value (`hasValue: true`).
- Update [CommandParser.ts](file:///G:/Codes/DockerPlay/src/lib/parser/CommandParser.ts) to parse positional arguments, subcommands, and flags.
- Register shell autocomplete hints and help descriptions in [CommandDictionary.ts](file:///G:/Codes/DockerPlay/src/lib/parser/CommandDictionary.ts).

### 3. State Machine & Simulator Logic (`src/lib/simulator/`)
- Implement execution handlers in [DockerEngine.ts](file:///G:/Codes/DockerPlay/src/lib/simulator/DockerEngine.ts).
- Follow the immutable state notification pattern:
  ```typescript
  // Mutate state draft
  this.state.containers[id] = newContainer;
  // Record event for visualizer timeline
  this.recordEvent('container', 'create', id, name, details);
  // Broadcast to all subscribers
  this.notify();
  ```
- Preserve authentic Docker error messages and exit codes (`0` on success, `1` or `125-127` on error).

### 4. UI & Visualizer Components (`src/components/`)
- Create reactive components subscribing to `getDockerEngine().subscribe(...)`.
- Strict styling adherence:
  - Backgrounds: `bg-zinc-950`, `bg-zinc-900/60`, borders: `border-zinc-800`.
  - Neon accents: Emerald `#10b981` (containers/success), Cyan `#06b6d4` (networks/DNS), Amber `#f59e0b` (volumes/warnings), Violet `#8b5cf6` (compose).
  - Lucide icons with consistent stroke widths (`strokeWidth={1.5}` or `2`).
  - Smooth transitions using `framer-motion` for container entry/exit.

### 5. Layout & Page Integration (`src/app/`)
- When creating workstation pages (`/playground`, `/curriculum`, `/break-fix`):
  - Container must specify `h-full min-h-0 overflow-hidden`.
  - Terminal wrapper column **must specify `min-h-0`** to prevent flex overflow.
- When creating document pages (`/tools/...`):
  - Wrapper must specify `flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden`.

---

## Phase 4: Quality & Verification Checklist

- [ ] **Static Export Safety**: Ensure no Next.js Node.js server dependencies (`fs`, server actions, route handlers) are introduced; DockerPlay uses `output: 'export'`.
- [ ] **Terminal Sizing Check**: Test `DockerTerminal` in both narrow (split pane / mobile) and full-screen viewports; title bar must remain single line.
- [ ] **State Machine Consistency**: Verify that resetting the environment (`dockerEngine.reset()`) cleanly resets the new feature's state.
- [ ] **Error Handling**: Test invalid arguments, unrecognized flags, missing container IDs, and verify Levenshtein fuzzy hints appear.
- [ ] **Typecheck & Lint**: Run `npm run lint` or `npx tsc --noEmit` to confirm zero TypeScript compilation errors.

