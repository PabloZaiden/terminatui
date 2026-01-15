# Migration and automation plan (semantic-first)

## Status

This document captures the agreed architecture direction:

- The framework/core layer expresses **what** the app is showing (semantic, screen-level).
- Renderer adapters (Ink/OpenTUI/etc.) decide **how** it is shown (layout/spacing/sizing) and **how** it is controlled (keyboard policy, key bindings, and any “legend/help” UI).
- Automation support is planned and type-shaped early to avoid design rewrites, but it is **lower priority** than the semantic refactor.

Constraints agreed:

- Semantic layer must not set layout (`padding`, `width`, `height`, `flex`, `gap`, etc.).
- Semantic layer must not bind keys or render explicit key legends.
- Logs do **not** have a framework-level “toggle logs” action.
- Framework actions are typed and minimal:
  - `nav.back`
  - `clipboard.copy`
- `clipboard.copy` is contextual and stack-based.
  - If invoked with no copy source available: **silently do nothing**.
- Editor is a single modal id:
  - `id: "editor"`
  - opened via navigation, closed via `nav.back`
  - editor shows the **current value as a string representation**

---

## 1. Architecture: target layering

### 1.1 Framework “semantic” layer (target)

Responsibilities:

- Declare the current framework screen and semantic state.
- Provide semantic events/callbacks.
- Provide the minimal framework action dispatcher (`nav.back`, `clipboard.copy`).
- Provide contextual services (e.g. stack-based copy source).

Non-responsibilities:

- No keyboard bindings or key event handling.
- No key legends or shortcut strings.
- No layout sizing, margins, or renderer-specific styling.

### 1.2 Transitional “mid-level” UI layer (existing, temporary)

The current set of components in `src/tui/components/**` and the current “semantic primitives” in `src/tui/semantic/**` are treated as a transitional implementation layer.

Policy:

- Keep them for now to avoid a big-bang rewrite.
- Avoid adding new framework-level dependencies on layout primitives.
- Over time, adapters should use these internally (or replace them), while the framework semantic layer stops importing them.

### 1.3 Renderer adapters (Ink/OpenTUI)

Responsibilities:

- Own layout composition: spacing, margins, default sizing, density, and terminal responsiveness.
- Own keyboard policy:
  - key bindings
  - dispatch order
  - text input capture rules
- Decide whether to render any help/legend UI and how.
- Map adapter key events to framework-level intents:
  - call `dispatchAction({ type: "nav.back" })`
  - call `dispatchAction({ type: "clipboard.copy" })`

Non-responsibilities:

- Adapters should not branch on routes or app-specific screens.
- Adapters implement rendering for a small, stable set of **framework semantic screen components**.

---

## 2. Semantic component set (screen-level only)

Adapters should only need to understand this set:

- `AppShell`
- `CommandBrowserScreen`
- `ConfigScreen`
- `RunningScreen`
- `LogsScreen` (as a screen/modal concept)
- `EditorScreen` (as a modal; id is always `"editor"`)

Notes:

- “Screen-level only” means we are not introducing additional reusable semantic sections (e.g. `KeyValueList`) at this stage.
- The existing mid-level components may exist during migration, but the semantic components above should not expose layout props.

### 2.1 `AppShell`

Purpose:

- A framework-level wrapper representing “the app is running, here is the main screen, here is the modal stack, and here is framework status”.

Inputs (conceptual):

- App identity: `name`, `displayName?`, `version`
- Current screen: one of the semantic screens below
- Modal stack: includes `LogsScreen` and `EditorScreen`
- Framework status: executing/ready + message

Non-goals:

- `AppShell` does not decide header placement, panel borders, padding, etc.

### 2.2 `CommandBrowserScreen`

Purpose:

- Show the list/tree of commands and allow selecting and running a command.

Stable identifiers:

- `commandId` is `string[]` representing the chain of command names.
- This matches the existing breadcrumb path and uniquely identifies a command.

Events should be semantic (not key handlers), e.g.:

- open a path
- select a command
- run selected command

### 2.3 `ConfigScreen`

Purpose:

- Edit a command’s configuration parameters.

Stable identifiers:

- `fieldId` is the field name.

Editor integration:

- Config can open the editor for **any field**.
- Editor is opened via navigation as the modal id `"editor"`.

### 2.4 `EditorScreen` (modal)

Purpose:

- Show an editor-like view for a field’s value.

Rules:

- One modal id: `"editor"`
- The editor must show the current value as a **string representation**.
- The editor’s view-model should be explicitly representable for automation snapshots.

Open/close:

- Open by navigation (e.g. `navigation.openModal("editor", { fieldId })`).
- Close via framework action `nav.back`.

### 2.5 `RunningScreen`

Purpose:

- Provide semantic status about execution: running/finished and any summary.

### 2.6 `LogsScreen`

Purpose:

- Show logs.

Important: there is no framework-level action to toggle logs.

- Adapters may bind keys to open logs if they want, but that is not expressed as a framework action.

---

## 3. Framework actions (typed, minimal)

### 3.1 Action type

We keep one exported typed action union (single “action type”):

- `{ type: "nav.back" }`
- `{ type: "clipboard.copy" }`

If more actions are needed later, they must remain framework-level and stable; avoid widget-level actions.

### 3.2 Dispatch semantics

- `nav.back` delegates to `navigation.goBack()`.
  - This already includes “close modal first, else pop back, else exit”.
- `clipboard.copy`:
  - resolve the top-most copy provider from a stack (modal overrides screen)
  - if no provider or provider returns null: **silently do nothing**
  - otherwise copy content and update framework status/notification

---

## 4. Copy context (stack-based)

### 4.1 Rationale

Copy is contextual: the framework action `clipboard.copy` must obtain content from the currently active semantic context, not from renderer-specific selection or keywords.

### 4.2 Model

- A `CopySource` provides:
  - `getCopy(): { label: string; content: string } | null`

- The framework holds a stack of copy sources.
  - top-most wins
  - modals naturally override screens

### 4.3 Registration policy

- Each semantic screen or modal that wants to provide copy registers a `CopySource` on mount and unregisters on unmount.

---

## 5. Keyboard and legend ownership (adapter-only)

### 5.1 Keyboard

- Keyboard dispatch policy is adapter-only.
- Key bindings are adapter-only.
- Core must not contain a global keyboard handler and must not interpret specific key sequences.

### 5.2 Legend/help UI

- Adapters decide whether to show any legend.
- Adapters decide how it’s formatted and when it appears.
- The semantic layer should not render legend strings like “Esc Back”.

---

## 6. Migration plan (semantic-first)

### 6.1 Phase 0: inventory and mapping

- Identify all locations where layout props leak into “core-like” components.
- Identify keyboard logic in core (e.g. `TuiRoot` global shortcuts, keyboard context).
- Map each existing screen/modal to its semantic replacement.

### 6.2 Phase 1: introduce semantic screen contracts

- Add the semantic screen-level components listed in section 2.
- Ensure they take only domain state + semantic callbacks.
- Introduce `TuiAction` and `dispatchAction`.
- Introduce the copy source stack.

### 6.3 Phase 2: remove keyboard and legend from core

- Remove any core hard-coded shortcut strings.
- Remove any core hard-coded key interpretation.
- Move back/copy triggering to adapters by calling `dispatchAction`.

### 6.4 Phase 3: migrate screens

- Migrate each screen to render the new semantic component.
- Treat the old mid-level components as internal implementation details.
- The semantic layer should not import `Panel`, `Container`, `Overlay`, etc.

### 6.5 Phase 4: adapters render semantic screens

- Add adapter-level rendering implementations for each semantic screen.
- Adapters own layout decisions.

---

## 7. Automation mode (planned; not priority)

### 7.1 Why it exists

Because a keyboard-driven TUI is hard to automate, we add a renderer mode that:

- consumes a script describing conceptual steps
- outputs snapshots describing the app’s conceptual state

This lets an agent debug, inspect, and drive the app without simulating raw key presses.

### 7.2 New TUI mode

Add a new mode: `automation`.

- It is selected like other modes.
- The CLI surface should remain stable; scripts are provided by env var.

### 7.3 Script input

- Env var: `TERMINATUI_AUTOMATION_SCRIPT`
- The file is JSON.

Recommended shape:

```json
{
  "version": 1,
  "steps": [
    { "type": "sleep", "ms": 50 },
    { "type": "dispatch", "action": { "type": "nav.back" } }
  ]
}
```

### 7.4 Exported types (automation)

- `TuiAutomationScript`:
  - `{ version: 1; steps: TuiAutomationAction[] }`
- `TuiAutomationAction` (single action type):
  - `{ type: "sleep"; ms: number }`
  - `{ type: "dispatch"; action: TuiAction }`
  - `{ type: "command.select"; commandId: string[] }`
  - `{ type: "command.openPath"; commandId: string[] }`
  - `{ type: "command.run" }`
  - `{ type: "config.setValue"; fieldId: string; value: unknown }`
  - `{ type: "config.openEditor"; fieldId: string }` (opens modal id `"editor"`)

All navigation-based closures are done via `{ type: "dispatch", action: { type: "nav.back" } }`.

### 7.5 Snapshot output

- Output is written to stdout as newline-delimited JSON (NDJSON).
- The automation renderer exits when steps are complete.

Recommended events:

- `{"type":"step", "index": 0, "action": ...}`
- `{"type":"snapshot", "snapshot": ...}`
- `{"type":"done"}`
- `{"type":"error", "message": "..."}`

### 7.6 Snapshot contents (conceptual)

Snapshots must be semantic, not layout/terminal coordinates.

Minimum snapshot fields:

- Current screen route/id and its semantic state (screen-level, stable ids)
- Modal stack and its semantic state
- Status/execution state
- Copy availability (boolean + label)

Important: Snapshot data should be produced by the semantic framework layer (instrumented state), not by introspecting the React tree in the renderer.

---

## 8. Non-goals

- Do not attempt to provide “arrow-key navigation automation”.
  - Automation must operate by stable ids, not by UI traversal.
- Do not introduce widget-level actions into the framework action set.
- Do not encode renderer-specific layout decisions in semantic props.
