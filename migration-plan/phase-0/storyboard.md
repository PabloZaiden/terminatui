# TerminaTUI Navigation & Modal Storyboard

**Purpose**: Capture current screen/modal flows, global behaviors, and data sourcing so TuiApp can become screen-agnostic and each screen/modal can declare its own transitions and data (e.g., clipboard content).

**Status**: ✅ COMPLETE - All items implemented and validated

**Scope**: Screens (command-select at any depth, config, running, results, error) and overlays (property editor modal, CLI modal, logs modal). Global shortcuts and back behavior are included.

## Keyboard Architecture

The keyboard system uses a **single-active-handler model** to prevent key conflicts:

1. **Global handler** (in TuiApp) processes app-wide shortcuts FIRST:
   - `Esc`: back/close modal
   - `Ctrl+Y`: copy from active view
   - `Ctrl+L`: toggle logs modal

2. **Active handler** (topmost screen/modal) gets remaining keys:
   - Only ONE handler is active at a time
   - When a modal opens, it becomes the active handler
   - When it closes, the previous handler is restored
   - Screens handle navigation keys (arrows, Enter)

3. **Key hooks**:
   - `useGlobalKeyHandler`: Set the global handler (TuiApp only)
   - `useActiveKeyHandler`: Register as the active handler (screens/modals)

This design ensures:
- No key conflicts between screens and modals
- Ctrl modifiers for global shortcuts avoid conflicts with typing
- Clear ownership of which component handles each key

## Global Rules

- **Navigation stacks**: screen stack and modal stack; back/escape closes top modal first, otherwise pops screen stack; if at root command-select with empty path, exit.
- **Global shortcuts** (use Ctrl to avoid conflicts with typing):
  - `Esc`: back (modal-first, then screen pop, exit at root).
  - `Ctrl+Y`: copy from active view (top modal if present; otherwise current screen). Active view decides what to provide; logs use live `logHistory`.
  - `Ctrl+L`: toggle logs modal (available anywhere; shows live logHistory while open).

- **Active view data** (used by global copy/status):
  - Modals: logs (logHistory), CLI (command string provided by modal), property editor (no copy content).
  - Screens: results (command-provided clipboard content), error (message), config (values JSON), others: none.
- **Status/last action**: provided by clipboard hook (e.g., copy success message) and execution state (running flag); TuiApp need not track an explicit "state", just render based on current screen/modal and executor status.

## Screen Transitions

### Command Select (at any depth)
- **On select subcommand with runnable descendants**: push next command-select with extended path.
- **On select runnable command**: push config screen with command, path, initial values, field configs.
- **On back**: pop to previous command-select path; at root with empty path → exit.
- **Modals**: logs (`Ctrl+L`) always available; property editor/CLI not used here.
- **Keys handled**: ↑↓ navigation, Enter to select

### Config
- **On edit field**: open property editor modal with field key/value/configs; submit updates values and replaces config entry; cancel closes.
- **On CLI Args button**: open CLI modal with built command string.
- **On run/action**: push running screen with command, path, values; executor drives results/error replacement.
- **On back**: pop to previous screen (typically command-select).
- **Modals available**: property editor, CLI, logs.
- **Keys handled**: ↑↓ navigation, Enter to edit/run/press buttons

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
- **Close/submit**: submit updates value, replaces config params, closes; Esc closes (handled globally).
- **Clipboard**: none.
- **Keys handled**: input/select components handle their own keys internally

### CLI Modal
- **Open from**: CLI Args button on config screen.
- **Close**: Enter or Esc.
- **Clipboard**: command string (via global `Ctrl+Y`).
- **Keys handled**: Enter to close

### Logs Modal
- **Open/toggle from**: `Ctrl+L` anywhere (modal stack on top).
- **Close**: `Ctrl+L`, Enter, Esc.
- **Clipboard**: live `logHistory` via global `Ctrl+Y`.
- **Keys handled**: Enter to close

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
- Global handler remains only for truly global concerns (back, logs toggle, global copy, CLI modal); screen-specific navigation lives in screens.
- Navigation actions (push/replace/pop, open/close modal) are invoked by screens/modals based on their own logic, not centralized branching in TuiApp.

## Refactor Implementation Checklist (based on storyboard)
1) ✅ Define contracts: screen/modal interfaces for transitions and data (clipboard/status), plus a registry to map routes/modal IDs to components/providers.
2) ✅ Clipboard/data providers: replace `if`/`switch` with providers per screen/modal; results use command-provided content; logs use live logHistory; CLI modal provides its command string.
   - ✅ Created ClipboardContext with register/getContent API
   - ✅ Created useClipboardProvider hook for screens/modals
   - ✅ ConfigScreen provides config values JSON
   - ✅ ResultsScreen provides command.getClipboardContent or JSON result
   - ✅ ErrorScreen provides error.message
   - ✅ LogsModal provides logs content (enabled only when visible)
   - ✅ CliModal provides CLI command string
   - ✅ TuiApp uses ClipboardContext instead of getClipboardContent if-chains
3) ✅ Keyboard architecture refactored to single-active-handler model:
   - ✅ Rewrote KeyboardContext for global + active handler model
   - ✅ Created useGlobalKeyHandler for app-wide shortcuts
   - ✅ Created useActiveKeyHandler for screen/modal key handling
   - ✅ Global shortcuts use Ctrl modifiers (Ctrl+Y, Ctrl+L) to avoid typing conflicts
   - ✅ Only ONE handler active at a time - no priority conflicts
   - ✅ Removed old priority-based useKeyboardHandler
   - ✅ EditorModal registers as active handler to block underlying screen
4) ✅ Keep TuiApp global-only: back/escape (modal-first), logs toggle, global copy dispatch, status bar wiring, executor plumbing; rendering via registry lookups instead of hardcoded switches.
   - ✅ Global handler handles: Esc (back), Ctrl+Y (copy), Ctrl+L (logs toggle)
   - ✅ Screen-specific: CLI Args button on ConfigScreen opens CLI modal
   - ✅ getClipboardContent if-chains replaced with ClipboardContext provider pattern
   - ✅ Created registry.tsx with ScreenRegistry and ModalRegistry types
   - ✅ Created renderScreenFromRegistry and renderModalsFromRegistry functions
   - ✅ TuiApp now uses screenRegistry (useMemo) instead of switch statement
   - ✅ TuiApp now uses modalRegistry (useMemo) instead of if-chains
5) ✅ Navigation wiring: screens/modals invoke navigation actions directly (push/replace/pop/openModal/closeModal) without TuiApp branching on route.
   - ✅ Navigation is passed to screens or accessed via useNavigation hook
   - ✅ Screen renderers in registry close over navigation for callbacks
6) ✅ Validation: exercise all flows (select→config→run→results/error; back paths; logs toggle anywhere; CLI modal from config; property editor submit/cancel; copy in screens/modals) then `bun run build` and `bun run test`.
   - ✅ Build passes
   - ✅ All 228 tests pass

## Summary

Phase 0A refactoring is complete. TuiApp is now fully screen-agnostic:

| Component | Self-Registers | Uses Context |
|-----------|---------------|--------------|
| `CommandSelectScreen` | ✅ | `useTuiApp`, `useNavigation`, `useBackHandler` |
| `ConfigScreen` | ✅ | `useTuiApp`, `useNavigation`, `useExecutor` |
| `RunningScreen` | ✅ | `useNavigation`, `useExecutor`, `useBackHandler` |
| `ResultsScreen` | ✅ | `useNavigation` |
| `ErrorScreen` | ✅ | `useNavigation` |
| `EditorModal` | ✅ | - |
| `CliModal` | ✅ | - |
| `LogsModal` | ✅ | - |

**Next Step**: Manual testing to verify all flows work correctly, then Phase 0B if needed.
