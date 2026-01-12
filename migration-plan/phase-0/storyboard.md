# TerminaTUI Navigation & Modal Storyboard

**Purpose**: Capture current screen/modal flows, global behaviors, and data sourcing so TuiApp can become screen-agnostic and each screen/modal can declare its own transitions and data (e.g., clipboard content).

**Scope**: Screens (command-select at any depth, config, running, results, error) and overlays (property editor modal, CLI modal, logs modal). Global shortcuts and back behavior are included.

## Global Rules

- **Navigation stacks**: screen stack and modal stack; back/escape closes top modal first, otherwise pops screen stack; if at root command-select with empty path, exit.
- **Global shortcuts**:
  - `Esc`: back (modal-first, then screen pop, exit at root).
  - `Y`: copy from active view (top modal if present; otherwise current screen). Active view decides what to provide; logs use live `logHistory`.
  - `L`: toggle logs modal (available anywhere; shows live logHistory while open).
- **Screen-owned shortcuts/actions**:
  - Config owns `C` to open CLI modal; other screen-specific shortcuts live in their screens (only logs toggle stays global).
- **Active view data** (used by global copy/status):
  - Modals: logs (logHistory), CLI (command string provided by modal), property editor (no copy content).
  - Screens: results (command-provided clipboard content), error (message), config (values JSON), others: none.
- **Status/last action**: provided by clipboard hook (e.g., copy success message) and execution state (running flag); TuiApp need not track an explicit "state", just render based on current screen/modal and executor status.

## Screen Transitions

### Command Select (at any depth)
- **On select subcommand with runnable descendants**: push next command-select with extended path.
- **On select runnable command**: push config screen with command, path, initial values, field configs.
- **On back**: pop to previous command-select path; at root with empty path → exit.
- **Modals**: logs (`L`) always available; property editor/CLI not used here.

### Config
- **On edit field**: open property editor modal with field key/value/configs; submit updates values and replaces config entry; cancel closes.
- **On run/action**: push running screen with command, path, values; executor drives results/error replacement.
- **On `C` (screen-owned)**: open CLI modal with built command string.
- **On back**: pop to previous screen (typically command-select).
- **Modals available**: property editor, CLI, logs.

### Running
- **On success**: replace with results screen (includes command, path, values, result).
- **On failure**: replace with error screen (includes command, path, values, error).
- **On back/escape while running**: cancel execution and reset executor.
- **Modals available**: logs.

### Results
- **On back**: pop to previous screen (typically config or command-select).
- **Clipboard content**: command-provided content (e.g., `getClipboardContent`), not assumed to be JSON.
- **Modals available**: logs.

### Error
- **On back**: pop to previous screen (typically config or command-select).
- **Clipboard content**: error.message.
- **Modals available**: logs.

## Modals

### Property Editor Modal
- **Open from**: config screen field edit.
- **Close/submit**: submit updates value, replaces config params, closes; cancel closes.
- **Clipboard**: none.

### CLI Modal
- **Open from**: config screen (`C` shortcut).
- **Close**: enter/esc.
- **Clipboard**: command string (via global `Y`).

### Logs Modal
- **Open/toggle from**: `L` anywhere (modal stack on top).
- **Close**: `L`, enter, esc.
- **Clipboard**: live `logHistory` via global `Y`.

## Global Copy Resolution Order
1. Top modal (logs → live logHistory; CLI → command string from modal; property editor → none).
2. Screen: results (command-provided content), error (message), config (values JSON); otherwise none.

## Back/Escape Behavior
- If modal stack non-empty: close top modal.
- Else if running screen and executing: cancel & reset executor, remain or pop per current logic.
- Else if command-select with non-empty path: replace with path trimmed by one.
- Else if screen stack length > 1: pop.
- Else if root command-select with empty path: exit.
- Fallback: exit.

## Intended Refactor Goals (guidance for upcoming work)
- TuiApp becomes screen-agnostic: screens/modals declare their transitions and data providers (e.g., clipboard content) instead of hardcoded `switch`/`if` chains.
- Global handler remains only for truly global concerns (back, logs toggle, global copy); screen-specific shortcuts (e.g., `C` in config) move into their screen.
- Navigation actions (push/replace/pop, open/close modal) are invoked by screens/modals based on their own logic, not centralized branching in TuiApp.
