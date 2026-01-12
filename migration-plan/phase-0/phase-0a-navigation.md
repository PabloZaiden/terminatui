
**Last Updated:** 2026-01-12  
**Status:** In Progress (navigation stack, screens, modal stack, back handling complete; live logs copy via global shortcut)

---

## Goal

Replace mode-based state management with a navigation stack that encapsulates screen-specific state and provides natural back/forward navigation.

---

## Proposed Solution

### 1. Typed-but-Generic Screens

Keep the navigation layer generic; let the app supply the route map to get type safety without hardcoding route names into the navigation module.

```typescript
// App-owned map of routes → param shapes (undefined when no params)
type Routes = {
    'command-select': { path: string[] };
    config: { command: AnyCommand; values: Record<string, unknown>; focus?: string };
    running: { command: AnyCommand; values: Record<string, unknown> };
    results: { command: AnyCommand; values: Record<string, unknown>; result: unknown };
    error: { command: AnyCommand; values: Record<string, unknown>; error: Error };
};

// Reusable screen entry (params are optional when the route’s entry is undefined)
type ScreenEntry<R extends keyof Routes = keyof Routes> = {
    route: R;
    params?: Routes[R];
    meta?: { focus?: string; breadcrumb?: string[] };
};
```

**Benefits:**
- Typed per route without embedding route names in the navigation module
- Easy to add routes by updating the map in app code
- Optional metadata for focus/breadcrumb without inflating params
- Still simple: one entry type, optional params

### 2. Navigation API (Screens + Modals)

```typescript
interface NavigationAPI {
    // Screens
    current: ScreenEntry;
    stack: ScreenEntry[];
    push: <R extends keyof Routes>(screen: ScreenEntry<R>) => void;
    replace: <R extends keyof Routes>(screen: ScreenEntry<R>) => void;
    reset: <R extends keyof Routes>(screen: ScreenEntry<R>) => void;
    pop: () => void;
    canGoBack: boolean;

    // Modals (stacked overlays allowed)
    modalStack: ModalEntry[];
    currentModal?: ModalEntry;
    openModal: <ID extends keyof Modals>(modal: ModalEntry<ID>) => void;
    closeModal: () => void;
    hasModal: boolean;
}
```

**Pop rule:** back/escape closes the top modal first; only when there are no modals does it pop the screen stack.

### 3. Usage Examples

**Navigating from command selection to config:**
```typescript
// Old way
setMode(Mode.Config);
setSelectedCommand(command);
setCommandPath([...commandPath, command.name]);
setSelectedFieldIndex(0);
setFocusedSection(FocusedSection.Config);

// New way
push({
    type: 'config',
    command,
    path: [...currentPath, command.name],
    values: {},
    fieldIndex: 0,
    focusedSection: 'config',
    logsVisible: false,
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
pop(); // That's it!
```

**Opening a modal (stacked allowed):**
```typescript
openModal({ id: 'editor', params: { field: fieldName, value: currentValue } });
// Another modal on top (e.g., logs over editor)
openModal({ id: 'logs', params: { source: 'app' } });
// Back/escape closes logs first, then editor, then screens
```

---

## Implementation Tasks

### Task 0A.1: Create Navigation Context

**Status:** ✅ Completed

**Actions:**
- Implemented `NavigationContext` with generic `Routes` and `Modals` maps
- Added `modalStack` with typed entries
- Added `NavigationProvider` and `useNavigation()`
- Reducer manages screen stack (never empty) and modal stack
- Methods: push/replace/reset/pop; openModal/closeModal
- Pop/back rule: closes top modal first; otherwise pops screen while keeping at least one

**Validation Checkpoint:**
```
✓ Context imports and works
✓ Screen and modal stacks typed via app-provided maps
✓ Pop respects modal-first, stack never empties
```

### Task 0A.2: Create Screen Components

**Status:** ✅ Completed

**Actions Planned:**
- Create `src/tui/screens/` directory
- Create `CommandSelectScreen.tsx`
  - Extract logic from current CommandSelector usage
  - Accept `ScreenEntry` props and navigation API
  - Handle command selection → push config screen
- Create `ConfigScreen.tsx`
  - Extract logic from current Config mode rendering
  - Manage field selection/focus via params/meta
  - Handle run → push running screen
  - Handle CLI button → open `cli` modal
- Create `RunningScreen.tsx`
  - Show running state (logs now via modal)
  - Handle completion → replace with results/error screen
- Create `ResultsScreen.tsx`
  - Show results panel; logs come from modal
  - Handle focus cycling via meta/params
- Create `ErrorScreen.tsx`
  - Show error panel; logs come from modal
- Modals use modal stack, not screens
  - `editor` modal overlay (save/cancel)
  - `cli` modal overlay
  - `logs` modal overlay

**Validation Checkpoint:**
```
✓ Screens render with typed params/meta
✓ Navigation calls work (push/replace/pop)
✓ Modals open/close via modal stack
✓ No TypeScript errors
```

### Task 0A.3: Refactor TuiApp to Use Navigation + Modal Stacks

**Status:** ✅ Completed

**Actions Planned:**
- Wrap `TuiAppContent` with `<NavigationProvider>` using app `Routes`/`Modals`
- Remove `Mode` and UI booleans (`logsVisible`, `cliModalVisible`, etc.)
- Move command/path/selection/focus state into screen params/meta
- Replace `renderContent()` switch with screen stack renderer
- Back handling: close modal if present, else `pop()` (stack never empty)
- Keyboard handlers drive `push/replace/pop` and `openModal/closeModal`

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
- Navigation module no longer exports legacy `Screen` union; tests now validate generic API and typed entries.
- Modal overlays share `ModalBase` for consistent styling (used by editor/cli/logs).
- Completed: typed screens, TuiApp navigation + modal stack, modal-first back handling, global shortcuts (Esc back, Y copy) honoring active modal, live log copy uses logHistory.
- Remaining: proceed to Phase 0B keyboard bubbling redesign per plan.
