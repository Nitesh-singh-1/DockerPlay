---
name: bugfix
description: >-
  Diagnose, reproduce, isolate, and fix defects across DockerPlay. Use this skill when resolving
  parser failures, simulator state desynchronization, terminal rendering errors, layout overflows,
  or curriculum validation bugs.
---

# Bugfix & Defect Resolution Protocol

This skill provides a systematic troubleshooting guide for isolating and resolving defects in the DockerPlay browser sandbox and UI.

---

## 🔍 Triage Matrix & Common Failure Modes

### 1. Parser & Tokenizer Issues (`src/lib/parser/`)
- **Symptoms**: Flag values parsed as positional arguments, quotes inside commands stripped incorrectly, valid commands flagged as `unknown`.
- **Key Files**:
  - [ShellTokenizer.ts](file:///G:/Codes/DockerPlay/src/lib/parser/ShellTokenizer.ts): Look for issues handling quotes (`"`, `'`), backslashes, or spaces within flag arguments.
  - [DockerFlagDefinitions.ts](file:///G:/Codes/DockerPlay/src/lib/parser/DockerFlagDefinitions.ts): Check if a flag has `hasValue: true` or missing shorthand aliases.
  - [CommandParser.ts](file:///G:/Codes/DockerPlay/src/lib/parser/CommandParser.ts): Check subcommand branching (e.g. `docker volume inspect` vs `docker inspect`).

### 2. Simulator State Machine Desync (`src/lib/simulator/`)
- **Symptoms**: Containers stuck in wrong state, DNS failing on custom bridges, port collisions not rejected, `docker compose down` leaving orphaned networks.
- **Key Files**:
  - [DockerEngine.ts](file:///G:/Codes/DockerPlay/src/lib/simulator/DockerEngine.ts): State transitions, network IP allocation, volume mounts, event recording.
  - [DefaultState.ts](file:///G:/Codes/DockerPlay/src/lib/simulator/DefaultState.ts): Pre-seeded state integrity.
- **Rules to check**:
  - Container names on default `bridge` (`172.17.0.0/16`) **must never** resolve via DNS name.
  - Containers on custom bridges (`app-net`) **must** resolve via embedded DNS (`127.0.0.11`).
  - When a container is connected to multiple networks, user-defined bridge DNS has strict precedence.

### 3. Workstation Layout & Viewport Breaks (`src/app/` & `src/components/`)
- **Symptoms**: Workstation pages scroll vertically pushing terminal off-screen, terminal height collapses to zero, title bar wraps onto two lines in split mode.
- **Key Invariants to Audit**:
  - In `src/app/layout.tsx`: `html` and `body` must retain `h-screen w-screen overflow-hidden`.
  - In any flex/grid workstation layout (e.g. `/playground/page.tsx`):
    - Parent split container must have `h-full min-h-0 overflow-hidden`.
    - Every column/container holding `DockerTerminal` **MUST have `min-h-0`**. Without `min-h-0`, flexbox defaults to `min-height: auto`, which causes the terminal's internal scroll container to stretch infinitely downwards instead of scrolling internally.
  - In `DockerTerminal.tsx`:
    - Header must have `whitespace-nowrap truncate`.
    - Output console buffer must have `flex-1 min-h-0 overflow-y-auto`.
    - Input bar must have `shrink-0`.

### 4. Progress & Persistence Bugs (`src/lib/persistence/`)
- **Symptoms**: XP not incrementing, missions not marking completed, localStorage corrupting on old profiles.
- **Key File**:
  - [ProgressManager.ts](file:///G:/Codes/DockerPlay/src/lib/persistence/ProgressManager.ts): Validate JSON parsing, fallback defaults when keys are missing, and XP calculation.

---

## 🛠️ Step-by-Step Bugfix Workflow

### Step 1: Reproduce & Isolate
1. Determine the minimal reproduction steps:
   - Specific CLI command string (e.g. `docker run -d --name web -p 8080:80 nginx:alpine`)
   - Specific viewport width or page route
   - Specific user state (fresh session vs loaded preset)
2. Verify where the failure occurs:
   - **Parser level**: Run `CommandParser.parse(cmd)` and inspect AST tokens.
   - **Engine level**: Check `DockerEngine.execute(parsed)` state mutation.
   - **UI level**: Inspect React component render tree and Tailwind class application.

### Step 2: Implement Surgical Fix
- Adhere to the **Principle of Minimal Intervention**: fix the specific root cause without refactoring unrelated modules.
- Preserve all existing comments and documentation.
- Do not introduce server-side Node.js packages (e.g. `node:fs`, `node:path`) — the project builds as a client-side static bundle (`output: 'export'`).

### Step 3: Verification & Regression Testing
1. Re-run the reproduction scenario to verify the bug is eliminated.
2. Test adjacent edge cases:
   - Empty or malformed inputs.
   - Flags without values (e.g. `docker run -p nginx`).
   - Duplicate container / network / volume names.
   - Window resizing from desktop (1920px) to tablet (768px) and mobile (375px).
3. Verify that `notify()` is called whenever state changes so UI visualizers remain synchronized.

