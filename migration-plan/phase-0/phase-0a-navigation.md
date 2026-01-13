# Phase 0A: Stack-Based Navigation

**Last Updated:** 2026-01-12  
**Status:** ✅ COMPLETE - TuiApp is now fully screen-agnostic with self-registering components

---

## Goal

Replace mode-based state management with a navigation stack that encapsulates screen-specific state and provides natural back/forward navigation.

---

## Proposed Solution

### 1. Simplified Type-Safe Navigation

The navigation layer uses per-call generic type parameters instead of centralized type maps, making the API simpler while maintaining full type safety.

```typescript
// Each screen/modal exports its parameter interface
export interface CommandSelectParams {
    commandPath: string[];
}

export interface ConfigParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    fieldConfigs: FieldConfig[];
}

// Screen entries are typed per-call, not via a central map
export interface ScreenEntry<TParams = unknown> {
    route: string;
    params?: TParams;
    meta?: { focus?: string; breadcrumb?: string[] };
}

export interface ModalEntry<TParams = unknown> {
    id: string;
    params?: TParams;
}

// Screens/modals define static IDs
export class CommandSelectScreen extends ScreenBase {
    static readonly Id = "command-select";
    getRoute(): string {
        return CommandSelectScreen.Id;
    }
}
```

**Benefits:**
- No centralized type map to maintain
- Type safety provided via per-call generic parameters
- Each screen/modal owns its parameter interface
- Static IDs prevent typos and enable refactoring
- Simpler API with fewer concepts to learn

### 2. Navigation API (Screens + Modals)

```typescript
interface NavigationAPI {
    // Screens
    current: ScreenEntry;
    stack: ScreenEntry[];
    push: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
    replace: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
    reset: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
    pop: () => void;
    canGoBack: boolean;

    // Modals (stacked overlays allowed)
    modalStack: ModalEntry[];
    currentModal?: ModalEntry;
    openModal: <TParams>(id: string, params?: TParams) => void;
    closeModal: () => void;
    hasModal: boolean;
    
    // Back handling
    goBack: () => void;
    setBackHandler: (handler: BackHandler | null) => void;
}
```

**Key Changes from Previous Design:**
- Methods take route/id strings directly instead of objects
- Type safety via per-call generic parameters (`<TParams>`)
- No generic type parameters on `NavigationAPI` itself
- Simpler method signatures: `push(route, params)` vs `push({ route, params })`

**Pop rule:** back/escape closes the top modal first; only when there are no modals does it pop the screen stack.

### 3. Usage Examples

**Navigating from command selection to config:**
```typescript
// Old way (mode-based)
setMode(Mode.Config);
setSelectedCommand(command);
setCommandPath([...commandPath, command.name]);
setSelectedFieldIndex(0);
setFocusedSection(FocusedSection.Config);

// New way (navigation stack)
navigation.push<ConfigParams>(ConfigScreen.Id, {
    command,
    commandPath: [...commandPath, command.name],
    values: {},
    fieldConfigs: schemaToFieldConfigs(command.options),
});
```

**Going back:**
```typescript
// Old way - complex logic in handleBack()
if (mode === Mode.Running) {
    cancel();
    if (selectedCommand?.immediateExecution) {
        // 7 state updates...
    } else {
        // 2 state updates...
    }
}
// ... 4 more conditions

// New way
navigation.pop(); // That's it!
// Or use the back handler system:
navigation.goBack(); // Calls custom back handler if registered
```

**Opening a modal (stacked allowed):**
```typescript
// Using static IDs and type parameters
navigation.openModal<EditorModalParams>(EditorModal.Id, {
    fieldKey,
    currentValue: values[fieldKey],
    fieldConfigs,
    onSubmit: (value) => { /* ... */ },
    onCancel: () => navigation.closeModal(),
});

// Another modal on top (e.g., logs over editor)
navigation.openModal<LogsModalParams>(LogsModal.Id, { logs: logHistory });

// Back/escape closes logs first, then editor, then screens
```

**Using replace instead of push:**
```typescript
// Replace current screen (no back to previous)
navigation.replace<RunningParams>(RunningScreen.Id, {
    command,
    commandPath,
    values,
});
```

---

## Implementation Tasks

### Task 0A.1: Create Navigation Context

**Status:** ✅ Completed

**Actions:**
- Implemented `NavigationContext` without generic type parameters (simplified)
- Navigation methods use per-call generics for type safety
- Added `modalStack` with typed entries
- Added `NavigationProvider` and `useNavigation()`
- Reducer manages screen stack (never empty) and modal stack
- Methods: `push/replace/reset/pop` (for screens); `openModal/closeModal` (for modals)
- Pop/back rule: closes top modal first; otherwise pops screen while keeping at least one
- Back handler system via `setBackHandler()` for custom back behavior

**Validation Checkpoint:**
```
✓ Context imports and works
✓ Screen and modal stacks typed via app-provided maps
✓ Pop respects modal-first, stack never empties
```

### Task 0A.2: Create Screen Components

**Status:** ✅ Completed

**Actions Completed:**
- Created `src/tui/screens/` directory with screen base class
- Created `CommandSelectScreen.tsx`
  - Gets data from context (no props)
  - Static `Id` constant for type-safe references
  - Exports `CommandSelectParams` interface
  - Handle command selection → push config screen
- Created `ConfigScreen.tsx`
  - Gets data from context via `useNavigation().current.params`
  - Exports `ConfigParams` interface
  - Manage field selection/focus via params/meta
  - Handle run → push running screen
  - Handle CLI button → open `cli` modal
- Created `RunningScreen.tsx`
  - Show running state (logs accessible via modal)
  - Handle completion → replace with results/error screen
- Created `ResultsScreen.tsx`
  - Show results panel; logs accessible from modal
  - Handle focus cycling via meta/params
- Created `ErrorScreen.tsx`
  - Show error panel; logs accessible from modal
- Created modal wrappers extending `ModalBase`:
  - `EditorModal` - Property editor overlay (exports `EditorModalParams`)
  - `CliModal` - CLI arguments display (exports `CliModalParams`)
  - `LogsModal` - Log viewer (exports `LogsModalParams`)
  - Each has static `Id` constant for type-safe references

**Validation Checkpoint:**
```
✓ Screens render with typed params/meta
✓ Navigation calls work (push/replace/pop)
✓ Modals open/close via modal stack
✓ No TypeScript errors
```

### Task 0A.3: Refactor TuiApp to Use Navigation + Modal Stacks

**Status:** ✅ Completed

**Actions Completed:**
- Wrapped `TuiAppContent` with `<NavigationProvider>` (no generic parameters needed)
- Removed `Mode` enum and UI booleans (`logsVisible`, `cliModalVisible`, etc.)
- Moved command/path/selection/focus state into screen params/meta
- Replaced `renderContent()` switch with registry-based renderer
- Back handling: close modal if present, else `pop()` (stack never empty)
- Keyboard handlers drive `push/replace/pop` and `openModal/closeModal`
- Created centralized registration via `registerAllScreens()` and `registerAllModals()`

**Validation Checkpoint:**
```
✓ App launches to command select
✓ Navigate config/running/results/error via nav stack
✓ Back closes modals first, then screens
✓ Breadcrumbs and focus preserved via params/meta
✓ Logs/CLI/editor open as modals from any screen
✓ Legacy mode-based state removed
```

---

## Notes
- Navigation module no longer uses legacy `Screen` union or centralized type maps
- Navigation API simplified: no generic parameters, per-call type safety instead
- Modal overlays share `ModalBase` for consistent styling (used by editor/cli/logs)
- All screens and modals are self-contained (no props, context-only)
- Screens/modals registered centrally via `registerAllScreens()`/`registerAllModals()` in `TuiApp`
- TuiApp knows nothing about specific screens - uses registry lookups only
- Static `Id` constants on screens/modals enable type-safe string references
- Parameter interfaces exported from each screen/modal for type safety
- Build passes and all tests pass

## Architecture Achieved

### Screen-Agnostic TuiApp (~150 lines)
TuiApp now only handles:
1. Setting up providers (contexts)
2. Rendering current screen from registry (no knowledge of which screen)
3. Rendering modals from registry
4. Global shortcuts: Esc→goBack, Ctrl+Y→copy, Ctrl+L→logs

### Registry-Based Components
Each screen/modal:
- Takes NO props (gets everything from context)
- Uses hooks: `useTuiApp()`, `useNavigation()`, `useExecutor()`
- Handles its own transitions
- Defines a static `Id` constant for type-safe references
- Exports its parameter interface for type safety
- Registered centrally in `TuiApp` via registry functions

### Registration Flow
```typescript
// 1. Screen/modal defines its structure
export class ConfigScreen extends ScreenBase {
    static readonly Id = "config";
    getRoute(): string { return ConfigScreen.Id; }
    override component(): ScreenComponent { /* ... */ }
}
export interface ConfigParams { /* ... */ }

// 2. Registry exports centralized registration
export function registerAllScreens(): void {
    registerScreen(new CommandSelectScreen());
    registerScreen(new ConfigScreen());
    // ... other screens
}

// 3. TuiApp calls registration at module load
await registerAllScreens();
await registerAllModals();

// 4. Runtime: TuiApp uses registry to render
const ScreenComponent = getScreen(navigation.current.route);
```

### New Files Created
| File | Purpose |
|------|---------|
| `src/tui/registry.tsx` | Global registries with `registerScreen()` and `registerModal()` |
| `src/tui/context/ExecutorContext.tsx` | Shares command execution via `useExecutor()` |
| `src/tui/context/TuiAppContext.tsx` | App-level info via `useTuiApp()` |
| `src/tui/hooks/useBackHandler.ts` | Screens register their back behavior |
| `src/tui/modals/EditorModal.tsx` | Self-registering wrapper |
| `src/tui/modals/CliModal.tsx` | Self-registering wrapper |
| `src/tui/modals/LogsModal.tsx` | Self-registering wrapper |

### Key Type Signatures
```typescript
// Screen component - no props, gets data from context
type ScreenComponent = () => ReactNode;

// Modal component - receives typed params and onClose callback
type ModalComponent<TParams> = (props: { 
    params: TParams; 
    onClose: () => void;
}) => ReactNode;

// Back handler - return true if handled, false to use default
type BackHandler = () => boolean;

// Screen/modal entries - generic per usage
interface ScreenEntry<TParams = unknown> {
    route: string;
    params?: TParams;
    meta?: { focus?: string; breadcrumb?: string[] };
}

interface ModalEntry<TParams = unknown> {
    id: string;
    params?: TParams;
}

// Example screen with static ID and exported params
export class ConfigScreen extends ScreenBase {
    static readonly Id = "config";
    // ...
}
export interface ConfigParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    fieldConfigs: FieldConfig[];
}
```

## Next Steps
1. **Manual testing** - Verify all flows work correctly end-to-end
2. **Phase 0B** - Component-chain keyboard handling (if still needed after current refactor)
