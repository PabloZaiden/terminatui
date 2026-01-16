# Semantic-first implementation guide (detailed)

This document is the **actionable implementation companion** to `planning/migration-and-automation.md`.

- Primary architecture intent is described in `planning/migration-and-automation.md`.
- This guide turns that intent into concrete file-level changes and ordering.

## Cross references

- See `planning/migration-and-automation.md` section **1.1** for semantic-layer responsibilities.
- See `planning/migration-and-automation.md` section **2** for the semantic screen set.
- See `planning/migration-and-automation.md` section **3** for the minimal `TuiAction`.
- See `planning/migration-and-automation.md` section **4** for copy stack semantics.
- See `planning/migration-and-automation.md` section **5** for keyboard + legend adapter ownership.

---

## 0. Target end state (what done looks like)

At the end of this migration:

- The “core” TUI tree (framework layer) only renders **semantic screen components** (screen-level React components) and does **not**:
  - bind keys
  - interpret key sequences
  - show key legends/hints
  - choose layout (padding, widths, panel borders, etc.)
- Renderer adapters (Ink/OpenTUI) are responsible for:
  - binding their preferred keys (e.g. Esc for back, Ctrl+Y for copy)
  - rendering any key legend/help UI (or not)
  - rendering the app shell layout and placing the semantic screen(s) inside

---

## 1. Introduce semantic screen contracts

Create a new stable semantic UI surface that the adapters render.

### 1.1 Create semantic screen components

Create a new folder:

- `src/tui/semantic/**`

Add the screen-level semantic components described in `planning/migration-and-automation.md` section **2**:

- `src/tui/semantic/AppShell.tsx`
- `src/tui/semantic/CommandBrowserScreen.tsx`
- `src/tui/semantic/ConfigScreen.tsx`
- `src/tui/semantic/RunningScreen.tsx`
- `src/tui/semantic/LogsScreen.tsx`
- `src/tui/semantic/EditorScreen.tsx`

Rules for these components:

- They must not accept layout props (`padding`, `width`, `height`, `flex`, etc.).
- They must not bind keys.
- They must not include key legend UI.
- They should accept **domain state + semantic callbacks** only.

### 1.2 Semantic rendering lives on the adapter `Renderer`

Instead of a separate `SemanticRenderer` interface, semantic rendering is implemented directly on the adapter `Renderer` (`src/tui/adapters/types.ts`).

Each adapter exposes methods like:

- `renderSemanticAppShell(props)`
- `renderSemanticCommandBrowserScreen(props)`
- `renderSemanticConfigScreen(props)`
- `renderSemanticRunningScreen(props)`
- `renderSemanticLogsScreen(props)`
- `renderSemanticEditorScreen(props)`

This keeps the adapter boundary crisp: core renders semantic markers, and the active adapter is responsible for both rendering and keyboard policy.

---

## 2. Replace the route registry (framework navigation)

Per your decision “replace it”: stop using `src/tui/registry.ts` (route-to-component) as the driving mechanism.

### 2.1 Keep NavigationContext for stack semantics

We keep `src/tui/context/NavigationContext.tsx` because it already implements the back behavior described in `planning/migration-and-automation.md` section **3.2**.

But instead of a `route: string` that maps to a React component via registry, the `route` should become a **semantic route type** or similar stable id.

Recommended approach:

- Introduce a typed `TuiRoute` union:
  - `commandBrowser`
  - `config`
  - `running`
  - `results`
  - `error`
- Replace lookups through `getScreen()` with a direct switch on `TuiRoute`.

### 2.2 Modal stack

Modal ids should be stable and match the plan:

- Logs: `"logs"`
- Editor: `"editor"` (must remain the only editor id)

Other existing modals like `cli` remain transitional.

---

## 3. Move keyboard policy fully into adapters

Per `planning/migration-and-automation.md` section **5**:

- Core must not interpret key sequences.
- Adapters bind keys and call `dispatchAction`.

### 3.1 Action dispatch and copy stack

Use the already-introduced:

- `src/tui/actions.ts`
- `src/tui/context/ActionContext.tsx`
- `src/tui/context/ClipboardContext.tsx`

### 3.2 Adapter-level key bindings

Each adapter should register its own global key handler (via its existing keyboard adapter) and map keys to framework intents:

- Esc => `dispatchAction({ type: "nav.back" })`
- Ctrl+Y => `dispatchAction({ type: "clipboard.copy" })`

Logs opening is adapter-owned (your decision #3): adapters may bind Ctrl+L (or render a button) and call `navigation.openModal("logs")` indirectly via semantic screen callbacks.

---

## 4. Core: build a semantic-first root

### 4.1 `TuiRoot` becomes semantic

Update `src/tui/TuiRoot.tsx` to:

- Construct the current semantic screen props from core state (navigation params, executor state, logs store)
- Render `AppShell` with:
  - App identity
  - Current semantic screen props
  - Modal stack semantic props
  - Status (executing/ready + clipboard messages)

Important: `TuiRoot` should not import `src/tui/semantic/*` primitives like `Panel`, `Container`, etc.

### 4.2 Screens become state producers

Existing route-based screen components in `src/tui/screens/*` should be migrated to either:

- become pure state producers returning semantic props, or
- be deleted and replaced by semantic routing directly in `TuiRoot`.

Because we are “replacing the registry”, the preferred approach is:

- Move per-screen state + callbacks into `TuiRoot` (and possibly small helper classes), then render semantic screens.

---

## 5. Incremental migration strategy (concrete order)

To keep the repo buildable at each step:

- [x] 1. Add semantic component skeletons, no wiring yet.
- [x] 2. Add `SemanticRenderer` interface and implement it inside both adapters.
- [x] 3. Switch `TuiRoot` to render the adapter AppShell.
- [x] 4. Replace registry routing with semantic routing switch.
- [x] 5. Migrate screen-by-screen:
  - [x] Command browser
  - [x] Config
  - [x] Running
  - [x] Results + Error (currently mapped via `RunningScreenProps.kind`)
  - [x] Logs modal (semantic props include `onClose`)
  - [x] Editor modal (semantic props include `onCancel`)
- [x] 6. Remove legacy registry and any now-unused components.
- [x] 7. Move keyboard bindings out of `TuiRoot` into adapters.
- [x] 8. Final pass: ensure semantic layer doesn’t leak layout props.

---

## 6. Test/verification checklist

- Run `bun run build`
- Run `bun run test`
- Ensure no interactive app execution is used during CI/testing.

---

## Notes about automation mode

`planning/migration-and-automation.md` section **7** is explicitly non-priority.
This migration should keep the public surface compatible so automation can be added later without rework.
