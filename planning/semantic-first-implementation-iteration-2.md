# Semantic-first implementation: iteration 2 (decoupling + action-driven UI)

> **STATUS: ⏳ PENDING MANUAL TESTING** — Iteration 2.1 code fixes complete. Awaiting manual verification of keyboard navigation and status bar. See **Section 9: Iteration 2.1 Bugfixes**.

This document is a corrective follow-up to:

- `planning/semantic-first-implementation.md`
- `planning/migration-and-automation.md`

It documents architectural regressions introduced during the initial migration and lays out a refactor plan to restore the intended design: **action-driven**, **registry/driver-based**, **renderer-owned UI policy**, and **semantic contracts that don’t leak layout or domain logic into the root**.

---

## 0. Why this document exists

The current implementation “works” in the sense that it renders screens/modals, but it violates the migration’s goals in several systemic ways:

- `TuiRoot` has become a god object (routing, orchestration, domain decisions, UI decisions).
- Responsibilities are placed at the wrong layer (clipboard, status, typed parsing, CLI building).
- “Semantic” components are sometimes implemented as shared UI between adapters (instead of being contracts rendered *by* adapters).
- The system is not truly action-driven: adding/changing flows requires editing `TuiRoot`.

### 0.1 Document update protocol (non-negotiable)

Per `AGENTS.md` workflow guidance, this document is the authoritative checklist for the refactor.

- Every refactor slice must correspond to one or more checklist items here.
- If we change the approach (folder layout, driver shape, action set, ownership boundaries), update this document first, then implement.
- Never consider a slice "done" until:
  - `bun run build` passes
  - the relevant checklist item(s) are checked off

This is how we avoid reintroducing coupling while refactoring.

### 0.2 Verification goals

At the end of this iteration:

- `TuiRoot` is a thin host: providers + a single driver/registry render call.
- Screen and modal ownership exists as separate modules (controllers) that produce semantic props.
- Renderer policy is restored:
  - clipboard mechanism + keybindings live in adapters (or adapters/shared behavior)
  - status/legend rendering is adapter-specific (no shared UI)
- Adding a screen/modal no longer requires editing `TuiRoot` (only the registry/driver).

---

## 1. Observed problems (by architecture principle)

This section describes principles. For a complete, actionable inventory of the current violations with file/line references, see section **7. Coupling inventory**.

### 1.1 `TuiRoot` is doing screen composition via a large switch/if chain

**Symptom**

`src/tui/TuiRoot.tsx` currently:

- decides which screen to render (`if route === ...`)
- builds props for each screen
- contains screen-specific state (`commandSelectedIndex`, `configSelectedFieldIndex`, `editorBuffer`)
- hardcodes which modals exist and how to render them

**Why this is a problem**

- Makes adding a screen/modal require editing the root.
- Prevents feature ownership: “the editor owns editing”, “cli args screen owns cli args building”, etc.
- Forces domain decisions into a framework host.

**Target**

`TuiRoot` should be a host for:

- global context providers (logs store, navigation state, executor)
- a screen driver/registry that maps “current route id” to a screen implementation

It may carry global stores (logs), but it must not contain screen domain logic.

---

### 1.2 Domain decisions leaked into `TuiRoot`

Concrete examples that must *not* live in the root:

- Determining editor kind based on field type (enum/bool/number/text)
- Coercing typed values on submit
- Building a CLI command string
- Deciding what content Ctrl+Y copies
- Constructing the status message shown on screen

These are all screen- or system-owned behaviors.

**Target**

- Editor screen owns “edit a field” and the details of how.
- CLI args screen/modal owns “show/copy cli args” and building the string.
- Clipboard is an adapter policy (or a shared behavior module used by terminal adapters), not owned by core.
- Status messaging is owned by the system that triggers it (executor actions, copy action handler, etc.), not derived ad-hoc in `TuiRoot`.

---

### 1.3 Clipboard ownership is at the wrong layer

**Current approach**

We introduced `ClipboardContext` + `useClipboardProvider`, but `TuiRoot` registers providers based on route/modal.

**Problems**

- Clipboard behavior differs per renderer platform.
  - Terminal renderers: need a stack and explicit copy action.
  - Web renderer: clipboard may be native, may not want the same shortcut, may need permissions.
- “What to copy” is screen-owned, not root-owned.

**Target**

Clipboard handling should be a **renderer policy**:

- Adapters decide if clipboard exists.
- Adapters decide which key binds trigger copy.
- Screens can *optionally* expose copyable content via a semantic capability.

This implies the semantic contracts should support “screen can provide copy content”, but the adapter is the one that actually performs the copy.

---

### 1.4 Shared UI components between adapters breaks semantic intent

Example: `src/tui/components/StatusBar.tsx` is currently a shared concrete UI component used by both adapters.

**Why this is wrong**

The semantic-first goal is:

> “I want a status bar with this information. Each renderer displays it differently.”

If the UI is shared, we lose renderer control over:

- layout
- typography
- key legend policy
- affordances

**Target**

- `AppShell` is semantic and must include a semantic status contract.
- Each adapter implements its own status rendering.
- Shared code across terminal adapters may exist as *behavioral helpers* (formatters, reducers), not shared UI components.

---

### 1.5 Actions are not the main driver of navigation and behavior

We currently have some actions (`nav.back`, `clipboard.copy`, `logs.open`) but the screen transitions still largely happen by calling `navigation.push/replace/openModal` directly from `TuiRoot`.

**Target**

A *screen driver* (or registry) should define:

- initial screen
- how actions map to navigation changes

From the outside it should feel like:

- “dispatch action X”
- the driver updates navigation state
- the host renders the current screen semantic output

This is the key missing piece that led to `TuiRoot` accumulating too much knowledge.

---

## 2. Target architecture

### 2.1 Layers (strict)

1) **Core host (framework)**
- Provides navigation state, logs store, executor state.
- Renders the current semantic tree.
- Does not know about specific commands, fields, or per-screen domain decisions.

2) **Screen driver / registry (domain UI orchestration)**
- Knows how to map actions to navigation.
- Owns screen-specific state machines (selected indices, editor flow state).
- Produces semantic screen props.
- Owns modal stack composition.

3) **Semantic contracts**
- Small marker components with prop contracts.
- No layout props.
- No keyboard.
- No renderer-specific behavior.

4) **Renderer adapters**
- Own keyboard bindings.
- Own layout.
- Own clipboard implementation.
- Render semantic contracts to concrete UI.

### 2.2 Screen module responsibility

Each screen module should own:

- its local UI state (selection indices, editing flow)
- how to interpret domain data into editable representation
- any per-screen clipboard content (as a capability)
- any per-screen status messages it triggers

A screen module must *not* call low-level adapter UI primitives.

### 2.3 How navigation should work (high level)

- There is a typed `TuiRoute` union.
- There is a typed `TuiModalId` union.
- A `TuiDriver` owns a **reducer** (or class-based state machine) that takes:
  - current driver state
  - an action
  - and returns next driver state (including navigation decisions)
- `NavigationContext` can remain as a generic stack, but the *driver* is the thing that decides what to push.

---

## 3. Refactor plan (incremental and testable)

### 3.0 Proposed file/folder structure (concrete)

This section is intentionally concrete. The point is to make it obvious where new logic goes so it doesn’t flow back into `TuiRoot`.

Proposed new folders:

- `src/tui/driver/`
  - `TuiDriver.ts` (main orchestration class; owns registry and screen controllers)
  - `types.ts` (shared types: `TuiRoute`, `TuiModalId`, controller interfaces)
- `src/tui/controllers/`
  - `CommandBrowserController.ts`
  - `ConfigController.ts`
  - `ExecutionController.ts` (optional; extracted when config gets too big)
  - `EditorController.ts`
  - `LogsController.ts`
  - `ResultsController.ts` / `ErrorController.ts` (or a single `OutcomeController.ts`)
- `src/tui/adapters/shared/` (behavior-only utilities for terminal adapters)
  - `TerminalClipboard.ts` (OSC52/pbcopy implementation, no React)
  - `StatusMessageStore.ts` (optional common behavior)

Notes:

- Controllers should be **classes** (project convention) and should not import adapter UI components.
- Shared code under `adapters/shared` must be behavioral only.

### 3.1 Create a `TuiDriver` abstraction

Introduce `src/tui/driver/TuiDriver.ts` as the single orchestration unit.

**Decision (implemented first):** `TuiDriver` is provided via a React context/provider (`TuiDriverContext`) so semantic render/dispatch logic can access it without prop-drilling.

**Minimum surface area**

- constructed once in `TuiRoot`
- owns/initializes controllers
- bridges between:
  - navigation stack state (`NavigationContext`)
  - global stores (`logs`, `executor`, app identity)
  - renderer policy capabilities (clipboard/status)

**Proposed class shape**

```ts
class TuiDriver {
  constructor(deps: {
    app: { name: string; displayName?: string; version: string; commands: AnyCommand[] };
    navigation: NavigationAPI;
    logs: LogsContextValue;
    executor: ExecutorAPI;
    // Optional: renderer capabilities injected, not assumed.
    rendererCapabilities: {
      clipboard?: ClipboardCapability;
      status?: StatusCapability;
    };
  })

  renderAppShell(): AppShellProps

  // dispatched by adapters or by controllers (callbacks)
  dispatch(action: TuiAction): void
}
```

**Driver responsibilities (allowed)**

- keep a **registry mapping** (route id -> controller)
- delegate action handling to the active controller or to global handlers
- enforce typed route/modal IDs
- decide which controller “owns” the current screen or modal

**Driver responsibilities (forbidden)**

- no field coercion/select mapping
- no CLI building
- no log formatting
- no persistence policy
- no execution orchestration
- no status message formatting
- no clipboard mechanism

This creates the choke point for behavior while keeping domain logic in controllers.

**Why a driver instead of `TuiRoot`**

`TuiRoot` is React component host glue. The driver is the module that restores the previous “registry” feel: “show screen X”, “open modal Y”, “dispatch action Z”.

Notes:

- Prefer a class for top-level type safety and encapsulation.
- The driver can internally use small pure helper functions, but should not grow to a new god object: if it does, extract a controller.


### 3.2 Move screen logic out of `TuiRoot` into driver-owned controllers

Controllers are the unit of ownership.

Each controller should:

- own local UI state (selection indices, buffers)
- expose a `render()` method returning semantic screen props
- expose a `handleAction(action)` hook (optional) so driver can delegate
- provide “capabilities” (copy content, status intents) as data, not side-effects

**Base controller interface (proposed)**

```ts
interface ScreenController<TRoute extends TuiRoute, TProps> {
  readonly route: TRoute
  render(params: unknown): TProps
  handleAction?(action: TuiAction): boolean
}

interface ModalController<TId extends TuiModalId, TProps> {
  readonly id: TId
  render(params: unknown): TProps
  handleAction?(action: TuiAction): boolean
}
```

**Controller ownership guidelines**

- Controllers may call domain helpers (schema -> fields, build CLI, persistence) but those helpers should live outside `TuiRoot`.
- Controllers should not import adapter UI components.
- Controllers may expose semantic callbacks that map to driver-dispatched actions.

**Concrete controllers and their purview**

- `CommandBrowserController`
  - owns command selection index
  - owns command tree traversal + filtering (`supportsTui`)
  - emits breadcrumb

- `ConfigController`
  - owns field selection index
  - owns default value policy + persisted value merging
  - owns edit-field flow initiation (open editor modal)
  - owns execution flow initiation (delegate to ExecutionController if needed)

- `EditorController` (modal)
  - owns text buffer/select index
  - owns typed parsing/coercion
  - owns enum/bool option mapping
  - owns editor-level copy behavior (field value)

- `LogsController` (modal)
  - owns log formatting and windowing
  - owns copy behavior (logs text)

- `ExecutionController` (optional)
  - owns async execution orchestration
  - emits status signals (executing, cancelled, done)

- `ResultsController`/`ErrorController` (optional)
  - own how outcomes are presented

The driver stitches these together and owns the registry.


### 3.3 Make status/legend semantic-only and adapter-specific

Current issue: we have shared concrete UI components in `src/tui/components/*` used by multiple adapters.

Target:

- “Status info” is a semantic contract (data)
- each adapter decides:
  - where it shows status
  - how it formats it
  - whether it shows key legends/hints

**Proposed solution**

- Keep `AppShellProps.status` as the single semantic status contract.
- Remove shared `src/tui/components/StatusBar.tsx` usage inside adapters.
- Each adapter renders status as part of `renderSemanticAppShell`.

**Optional enhancement**

If we need more structure than a simple message string, expand the contract:

```ts
type StatusSeverity = "info" | "success" | "warning" | "error";

type AppStatus = {
  isExecuting: boolean;
  message: string;
  severity?: StatusSeverity;
  // optionally: "source" helps adapters style differently
  source?: "executor" | "clipboard" | "system" | "screen";
}
```

But keep it additive and conservative.


### 3.4 Move clipboard behavior to adapters (and make it capability-driven)

#### 3.4.1 Implementation decision (iteration 2)

We already have `TuiDriver.getActiveCopyPayload()` which resolves the correct copy source (topmost modal, otherwise current screen).

**Decision:** terminal adapters (`ink`, `opentui`) will implement copy by directly calling `useTuiDriver()` to fetch the active payload, and then running terminal clipboard behavior (`copyToTerminalClipboard`) inside the adapter.

Rationale:

- Keeps core (`TuiRoot`) free of copy policy and mechanism.
- Avoids reintroducing a renderer capability registration API that would need lifecycle management.
- The adapter render tree already lives under `TuiDriverProvider`, so `useTuiDriver()` is available.

Guardrail:

- Adapters may depend on driver context, but they must not depend on screen/controller internals. The only allowed surface is `getActiveCopyPayload()` (and potentially other driver-owned renderer-policy APIs in the future).

Clipboard has two separate concerns:

1) **Mechanism** (how to copy) -> renderer policy
2) **Content** (what to copy) -> screen/modal capability

**Mechanism target**

- Terminal adapters may implement OSC52/pbcopy.
- Web adapter may implement native `navigator.clipboard` or do nothing.
- Therefore clipboard mechanism must not live in core.

**Content target (this is the key rule)**

- Every *screen or modal controller* that has potentially copyable content (logs, active editor value, results, errors, config CLI args, etc.) must expose it via a top-level capability.
- The renderer never hardcodes “copy logs” or “copy cli”. It always asks for the **active** payload.

**Active payload resolution**

- If a modal is open, the **topmost modal** is the active copy source.
- Otherwise, the **current screen** is the active copy source.
- If the active source has nothing to copy, `null` is returned.

This preserves the layering:

- Screens/modals decide what their copy payload means.
- The driver decides which one is “active”.
- The adapter decides how/when to copy.

**Proposed capability shape**

```ts
type CopyPayload = { label: string; content: string };

interface CopySource {
  getCopyPayload(): CopyPayload | null;
}
```

**Proposed driver API**

```ts
class TuiDriver {
  // Prefer topmost modal; else current screen.
  getActiveCopyPayload(): CopyPayload | null
}
```

**Important**

- This is exactly where we must keep platform ownership: don’t let the core assume a clipboard exists.
- Terminal-specific clipboard code (OSC52/pbcopy) must move under adapters (or `src/tui/adapters/shared`).


### 3.5 Reintroduce a registry-like mapping (route/modal -> controller)

Instead of a giant `if` chain in `TuiRoot`, use a mapping owned by the driver.

**Proposed mapping**

```ts
const screenControllers: Record<TuiRoute, ScreenController<any, any>> = {
  commandBrowser: new CommandBrowserController(...),
  config: new ConfigController(...),
  running: new RunningController(...),
  results: new ResultsController(...),
  error: new ErrorController(...),
}

const modalControllers: Record<TuiModalId, ModalController<any, any>> = {
  logs: new LogsController(...),
  editor: new EditorController(...),
}
```

**Root becomes**

- `driver.renderAppShell()`
- `RenderAppShell(driver props)`

Adding a new screen/modal becomes:

- create controller
- register it in the mapping

No changes required in `TuiRoot` itself.


---

## 4. Migration checklist (update as we go)

This checklist is intentionally exhaustive. It is not just examples (status/clipboard/editor were early signals). The goal is to eliminate *all* root coupling and restore the action-driven architecture described above.

### Phase A: Document + scaffolding

- [x] Add typed ids: `TuiRoute`, `TuiModalId`, `TuiAction` ownership boundaries
- [x] Add `src/tui/driver/types.ts` for shared driver/controller types
- [x] Add `TuiDriver` skeleton (`src/tui/driver/TuiDriver.ts`)
- [x] Make clipboard provider registration optional in core (prep for adapter ownership)
- [x] Ensure `TuiRoot` only delegates to driver (providers + `driver.renderAppShell()`)
- [x] Add a “no new coupling” test heuristic (optional)
  - Example: a test that asserts `TuiRoot` does not import domain helpers like `buildCliCommand` or `schemaToFieldConfigs`

### Phase B: Move screen ownership out of root

- [x] Command browser controller
  - [x] owns `commandSelectedIndex`
  - [x] owns `getCommandsAtPath` traversal + `supportsTui()` filtering
  - [x] emits breadcrumb via semantic props
- [x] Config controller
  - [x] owns `configSelectedFieldIndex`
  - [x] owns parameter defaults computation (currently `initializeConfigValues`)
  - [x] owns persistence load/save policy (`loadPersistedParameters`/`savePersistedParameters`)
  - [x] owns execution orchestration (navigate -> execute -> navigate)
- [x] Running/results/error controller
  - [x] owns composition choice (don’t hardcode variants in `TuiDriver`/`TuiRoot`)
- [x] Logs modal controller
  - [x] owns log formatting + scroll windowing
  - [x] exposes copy content capability (if supported)
- [x] Editor modal controller
  - [x] owns editor buffer state and typed coercion/parsing
  - [x] owns enum/bool select mapping and index management
  - [x] owns CLI arguments affordance (or delegates to CLI args controller)
  - [x] exposes copy content capability (if supported)

### Phase C: Renderer policy corrections

- [x] Status / legend becomes semantic contract, adapter-specific rendering
  - [x] remove shared UI component usage (currently `src/tui/components/StatusBar.tsx`)
  - [x] ensure adapters render status in their own style
  - [x] ensure “legend/key hints” are adapter-owned (or absent)
- [x] Clipboard becomes adapter-owned (including copy keybindings)
   - [x] make clipboard context optional in core (preparatory step)
   - [x] move terminal clipboard implementation out of core (`src/tui/hooks/useClipboard.ts`)
   - [x] make copy action dispatch optional per renderer (web renderer may not bind)
   - [x] adapters implement copy by reading active payload from `TuiDriver.getActiveCopyPayload()` and invoking terminal clipboard behavior
   - [x] adapter-owned copy feedback (transient “Copied …” message)

- [x] Remove any shared UI components used by both adapters
  - [x] audit `src/tui/components/*` used inside adapters; convert to semantic contracts or adapter-specific UI
  - [x] adapters no longer import `src/tui/components/*` directly (moved to adapter-local UI)

#### Phase C implementation decision (iteration 2)

We currently have several shared UI components under `src/tui/components/*` that are imported by both terminal adapters via `SemanticInkRenderer` and `SemanticOpenTuiRenderer`:

- `Header`
- `CommandSelector`
- `ConfigForm`
- `ResultsPanel`

These are **concrete UI** (they compose semantic layout and policies together) and therefore violate the guardrail “no shared UI components across renderers”.

**Decision:** move these components into adapter-specific implementation:

- Ink: `src/tui/adapters/ink/ui/*`
- OpenTUI: `src/tui/adapters/opentui/ui/*`

(Names are flexible but they must live under the adapter and be imported only by that adapter.)

Guardrail: shared code between terminal adapters may remain under `src/tui/adapters/shared/*` but must be **behavior-only** (no React UI).

Implementation approach:

1) create adapter-local copies of each component (minimal behavior-preserving copy)
2) update `SemanticInkRenderer.tsx` and `SemanticOpenTuiRenderer.tsx` imports to use adapter-local versions
3) delete nothing yet; once no shared usage remains, we can optionally delete the old shared components or leave them for later cleanup

## Next steps (current)

**Iteration 2 is COMPLETE.** All Phase A/B/C/D checklist items are done and guarded by tests.

### Summary of what was accomplished

1. **Adapter-owned clipboard**
   - [x] Stopped copying from `src/tui/TuiRoot.tsx`.
   - [x] Terminal adapters own copy mechanism using `TuiDriver.getActiveCopyPayload()` + `copyToTerminalClipboard()`.
   - [x] Adapters show transient feedback on successful copy.

2. **Removed shared UI usage in adapters**
   - [x] Replaced shared UI imports in adapters by moving adapter-local UI into:
     - Ink: `src/tui/adapters/ink/ui/*`
     - OpenTUI: `src/tui/adapters/opentui/ui/*`
   - [x] Deleted unused `src/tui/components/types.ts`; moved types into `src/tui/semantic/types.ts`.
   - Remaining in `src/tui/components/`: only `JsonHighlight.tsx` (public export, must stay).

3. **Completed Phase B/D coupling removal**
   - [x] `running`/`results`/`error` moved to `OutcomeController`.
   - [x] Config controller owns defaults/persistence/execution orchestration.
   - [x] Logs modal controller owns formatting/windowing + copy payload.
   - [x] Editor modal controller owns parsing/coercion + buffer/copy.
   - [x] Command browser controller owns selection state, traversal/filtering, and breadcrumb.

4. **Guardrail tests added**
   - `src/__tests__/tuiRootNoCoupling.test.ts` — asserts `TuiRoot` does not import domain helpers.
   - `src/__tests__/adapterNoSharedUi.test.ts` — asserts adapters do not import `src/tui/components/*`.

5. **Verification**
   - `bun run build` passed.
   - `bun run test` passed (78 tests).

### Optional future work (not required for iteration 2)

- Add more controller/adapter unit tests if coverage is desired.
- Begin planning iteration 3 (e.g., web adapter support, improved action dispatch, or new features).

### Phase D: Remove leftover coupling (root must become a thin host)


- [x] No CLI building in root (`buildCliCommand` usage)
- [x] No field typing/editing logic in root (enum/bool select, parsing, coercion)
- [x] No command traversal/selection logic in root (`getCommandsAtPath`, indices)
- [x] No parameter defaulting/persistence logic in root (`initializeConfigValues`, load/save)
- [x] No execution orchestration logic in root (navigate/execute/outcome handling)
- [x] No “what to copy” logic in root (route/modal clipboard provider selection)
- [x] No status message derivation in root (message formatting + timeouts)
- [x] No direct modal rendering switch in root (registry/controller decides)
- [x] No inconsistency between semantic screen ids/modals and action handling (typed ids)

---

## 5. Guardrails (for every PR / iteration)

- `TuiRoot` must not grow new route-specific `if/switch` logic.
- Root must not introduce new screen-specific state.
- Semantic contracts must not accept layout props.
- Shared code between renderers must be behavioral; no shared UI components.
- Any “capability” (copyable content, status messages) is exposed by screens and interpreted by renderers.
- When in doubt, create a controller/module, not another `if` in the host.

**Doc discipline**

- If an implementation choice violates a guardrail, stop and update this doc to record the exception + rationale, or change approach so it doesn’t violate the guardrail.

---

## 6. Current state (as of this document)

Summary: this repo is currently in a transitional hybrid state.

- `src/tui/TuiRoot.tsx` is now a thin host (providers + `driver.renderAppShell()`).
- Adapters render semantic screens and keep concrete UI adapter-local (no shared `src/tui/components/*` imports inside adapters).
- `TuiDriver` delegates `running`/`results`/`error` composition to `OutcomeController` (no hardcoded outcome variants inside the driver).
- `CommandBrowserController` now owns selection state, traversal/filtering, and breadcrumb.
- `ConfigController` now owns config selection state, defaults/persistence policy, and the async run flow (navigate  execute  results/error).
- `LogsController` now owns log formatting/windowing and provides a copy payload.
- `EditorController` now owns editor buffer/select state, parsing/coercion, and provides a copy payload.
- Clipboard mechanism is adapter-owned (`ink`/`opentui` call `TuiDriver.getActiveCopyPayload()` + terminal clipboard behavior), and adapters now show transient “Copied …” feedback after Ctrl+Y.

The goal of iteration 2 is to restore the intended layering so that future renderers (including web) can exist without special-casing the core.

Cleanup note: removed legacy clipboard context/hooks and legacy shared UI components under `src/tui/components/*` that were no longer referenced by the semantic-first architecture. `JsonHighlight` remains for external consumers.

For the full list of concrete violations and what to do about them, see **7. Coupling inventory**.

---

## 7. Coupling inventory (actionable, with file/line references)

This section is kept for historical context, but most of the original root-coupling items have now been resolved.

**Current status**

- `src/tui/TuiRoot.tsx` is now a thin host (providers + `driver.renderAppShell()`), and the old violations listed below no longer exist in that file.
- The remaining meaningful coupling risks are:
  - accidentally reintroducing domain/helper imports into `TuiRoot` (guarded by `src/__tests__/tuiRootNoCoupling.test.ts`)
  - accidentally sharing concrete UI components across adapters

### 7.1 Root-coupling inventory (resolved)

All of the legacy items below refer to an older, pre-driver `src/tui/TuiRoot.tsx` implementation and are now **resolved**:

- Root selecting screens/modals via large `if/switch` chains
- Root owning per-screen selection/buffer state
- Root orchestrating execution flow + persistence
- Root deciding status wording/timeouts
- Root owning clipboard providers and terminal clipboard mechanism
- Root embedding editor semantics (parsing/coercion/select mapping)
- Root building CLI command strings

If any of these patterns reappear, they should be treated as a regression and fixed by moving the logic into a controller or adapter policy module.

---

## 8. Design decisions (resolved)

These items were open questions during the refactor. They have now been resolved:

- **Are navigation params meant to be a minimal route id + lightweight ids, or do we allow large domain objects in navigation state?**
  - **Resolved**: Large domain objects are allowed. `ConfigRouteParams` contains `command: AnyCommand`, `values: Record<string, unknown>`, and `fieldConfigs`. This was a pragmatic choice to avoid a separate state store for route-specific data.

- **Should execution orchestration live inside config controller, or a separate execution controller shared across screens?**
  - **Resolved**: Execution orchestration lives in `ConfigController.run()`. No separate `ExecutionController` was created — the config controller owns the full flow (persist → navigate to running → execute → navigate to results/error).

- **Should clipboard be a capability on `AppShell` (top-level) or per-screen/per-modal capability?**
  - **Resolved**: Per-screen/per-modal. Each controller that has copyable content implements `getCopyPayload()`. The driver's `getActiveCopyPayload()` resolves which controller is "active" (topmost modal, else current screen).

- **How are status messages modeled: explicit store vs "events" vs screen-driven message props?**
  - **Resolved**: Simple driver-owned getter (`statusMessage`) based on executor state. No explicit store or event system. Adapters can overlay transient feedback (e.g., "Copied…") independently.


These items may evolve. If any decision changes, apply the "Document update protocol" first.

- Are navigation params meant to be a minimal route id + lightweight ids, or do we allow large domain objects in navigation state?
- Should execution orchestration live inside config controller, or a separate execution controller shared across screens?
- Should clipboard be a capability on `AppShell` (top-level) or per-screen/per-modal capability?
- How are status messages modeled: explicit store vs "events" vs screen-driven message props?

---

## 9. Iteration 2.1 Bugfixes (manual testing issues)

### Problem summary

Manual testing of the example app revealed three critical bugs affecting both `ink` and `opentui` adapters:

1. **Keyboard navigation not working** — Up/down arrows do not move selection in the command browser.
2. **App exit not working** — Esc does not exit the app from the root screen.
3. **"Ready" appears twice in status bar** — Duplicate status rendering.

### Root cause analysis

#### Bug 1 & 2: Keyboard not working

The `registerActionDispatcher` method is defined in both `InkRenderer.tsx:141` and `OpenTuiRenderer.tsx:141` but is **never called** anywhere in the codebase.

This method:
- Sets up the global keyboard handler via `this.keyboard.setGlobalHandler()`
- Handles `escape` → `nav.back` action dispatch
- Handles `up`/`down` → screen-specific navigation via `this.semanticScreenKeyHandler`
- Handles `ctrl+y` → copy, `ctrl+l` → logs

Without calling `registerActionDispatcher`, no keyboard events are processed.

**Fix:** Wire up `registerActionDispatcher` to be called when the renderer mounts. This likely needs to happen inside the render tree where the action dispatcher (navigation context) is available.

#### Bug 3: "Ready" appears twice

In both `SemanticInkRenderer.tsx:36-44` and `SemanticOpenTuiRenderer.tsx:37-45`, the status bar renders:

```tsx
<Container flexDirection="row">
    <Label color="mutedText">{props.status.isExecuting ? "Executing..." : "Ready"}</Label>
    <Label color={props.copyToast ? "success" : "mutedText"} bold={Boolean(props.copyToast)}>
        {props.copyToast ?? props.status.message}
    </Label>
</Container>
```

The first `<Label>` hardcodes "Ready"/"Executing...".
The second `<Label>` shows `props.copyToast ?? props.status.message` — and `props.status.message` is ALSO "Ready"/"Executing..." (from `TuiDriver.statusMessage`).

So when there's no copy toast, both labels show "Ready".

**Fix:** The second label should only render when there's a `copyToast`. The status message is already handled by the first label.

**Architectural note:** This duplication is acceptable here because both adapters independently implement their status bar UI. However, the copy-paste pattern led to the same bug in both. This is adapter-local UI (allowed), not shared UI (disallowed).

### Checklist

#### Phase 2.1A: Fix keyboard handling

- [x] Wire up `registerActionDispatcher` in both renderers
  - [x] Find where action dispatch (navigation) is available in the render tree
  - [x] Refactored `registerActionDispatcher` → `renderKeyboardHandler` (returns React component)
  - [x] Created `TuiRootKeyboardHandler` component for proper hook usage
  - [x] Created `InkKeyboardHandler` and `OpenTuiKeyboardHandler` components
- [x] Fix selection state reactivity — moved from controller internal state to navigation params
  - [x] `CommandBrowserRouteParams.selectedIndex` — triggers re-render on selection change
  - [x] `ConfigRouteParams.selectedFieldIndex` — triggers re-render on selection change
- [ ] Verify keyboard navigation works in command browser (ink) — **NEEDS MANUAL TEST**
- [ ] Verify keyboard navigation works in command browser (opentui) — **NEEDS MANUAL TEST**
- [ ] Verify Esc exits app from root screen (ink) — **NEEDS MANUAL TEST**
- [ ] Verify Esc exits app from root screen (opentui) — **NEEDS MANUAL TEST**

#### Phase 2.1B: Fix status bar duplication

- [x] Fix `SemanticInkRenderer.tsx` status bar — only show copy toast when present
- [x] Fix `SemanticOpenTuiRenderer.tsx` status bar — only show copy toast when present
- [ ] Verify "Ready" appears only once (ink) — **NEEDS MANUAL TEST**
- [ ] Verify "Ready" appears only once (opentui) — **NEEDS MANUAL TEST**

#### Phase 2.1C: Additional keyboard bug (OpenTUI only)

- [x] Fix `OpenTuiRenderer.tsx:54-57` — Ctrl+L handler returns `true` (blocks global handler)
  - Should return `false` like the Ink version to allow logs.open action to dispatch

#### Phase 2.1D: Verification

- [x] `bun run build` passes
- [x] `bun run test` passes (78 tests)
- [ ] Manual test: ink command browser navigation with up/down — **NEEDS MANUAL TEST**
- [ ] Manual test: ink Esc to exit from root — **NEEDS MANUAL TEST**
- [ ] Manual test: opentui command browser navigation with up/down — **NEEDS MANUAL TEST**
- [ ] Manual test: opentui Esc to exit from root — **NEEDS MANUAL TEST**
- [ ] Manual test: status bar shows "Ready" only once (both adapters) — **NEEDS MANUAL TEST**

### Implementation notes (iteration 2.1)

**Key architectural changes:**

1. **Keyboard handler refactor**: Changed from `registerActionDispatcher` (a method that used hooks illegally) to `renderKeyboardHandler` (returns a React component). This allows proper use of `useInput` / `useKeyboard` hooks within a component tree.

2. **Selection state moved to navigation params**: Controllers were using internal class state (`#commandSelectedIndex`, `#configSelectedFieldIndex`) which didn't trigger React re-renders. Now selection state lives in route params (`params.selectedIndex`, `params.selectedFieldIndex`) and controllers call `navigation.replace()` to update — this properly triggers re-renders.

**Files modified:**
- `src/tui/TuiRoot.tsx` — Added `TuiRootKeyboardHandler` component
- `src/tui/context/ActionContext.tsx` — Simplified, removed callback pattern
- `src/tui/adapters/types.ts` — Changed `registerActionDispatcher` → `renderKeyboardHandler`
- `src/tui/adapters/ink/InkRenderer.tsx` — Created `InkKeyboardHandler` component
- `src/tui/adapters/opentui/OpenTuiRenderer.tsx` — Created `OpenTuiKeyboardHandler` component
- `src/tui/adapters/ink/SemanticInkRenderer.tsx` — Fixed status bar duplication
- `src/tui/adapters/opentui/SemanticOpenTuiRenderer.tsx` — Fixed status bar duplication
- `src/tui/driver/types.ts` — Added `selectedIndex` to `CommandBrowserRouteParams`, `selectedFieldIndex` to `ConfigRouteParams`
- `src/tui/controllers/CommandBrowserController.tsx` — Use navigation params for selection
- `src/tui/controllers/ConfigController.tsx` — Use navigation params for selection
