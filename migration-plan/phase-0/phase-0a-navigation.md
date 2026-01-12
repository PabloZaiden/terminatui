# Phase 0A: Stack-Based Navigation

**Last Updated:** 2026-01-10  
**Status:** Ready for Implementation

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

**Actions:**
- [ ] Implement `NavigationContext` with a generic `Routes` map (app-supplied)
- [ ] Implement `ModalEntry` + `modalStack` with a generic `Modals` map
- [ ] Implement `NavigationProvider` and `useNavigation()`
- [ ] Use state (or reducer) to manage screen stack (never empty) and modal stack
- [ ] Methods: push/replace/reset/pop for screens; openModal/closeModal for modals
- [ ] Pop/back rule: close top modal if present; otherwise pop screen (keep at least one screen)

**Validation Checkpoint:**
```
✓ Context can be imported and used
✓ Screen and modal stacks are typed via app-provided maps
✓ Pop respects modal-first, stack never empties
```

**If validation fails:** Iterate on API design until clean and type-safe.

---

### Task 0A.2: Create Screen Components

**Actions:**
- [ ] Create `src/tui/screens/` directory
- [ ] Create `CommandSelectScreen.tsx`
  - [ ] Extract logic from current CommandSelector usage
  - [ ] Accept `ScreenEntry` props and navigation API
  - [ ] Handle command selection → push config screen
- [ ] Create `ConfigScreen.tsx`
  - [ ] Extract logic from current Config mode rendering
  - [ ] Manage field selection/focus via params/meta
  - [ ] Handle run → push running screen
  - [ ] Handle CLI button → open `cli` modal
- [ ] Create `RunningScreen.tsx`
  - [ ] Show running state (logs now via modal)
  - [ ] Handle completion → replace with results/error screen
- [ ] Create `ResultsScreen.tsx`
  - [ ] Show results panel; logs come from modal
  - [ ] Handle focus cycling via meta/params
- [ ] Create `ErrorScreen.tsx`
  - [ ] Show error panel; logs come from modal
- [ ] Modals: use modal stack instead of treating modals as screens
  - [ ] `editor` modal overlay (save/cancel)
  - [ ] `cli` modal overlay
  - [ ] `logs` modal overlay (replaces old panel)

**Validation Checkpoint:**
```
✓ Screens render with typed params/meta
✓ Navigation calls work (push/replace/pop)
✓ Modals open/close via modal stack
✓ No TypeScript errors
```

**If validation fails:** Fix screen component logic and props, iterate until working.

---

### Task 0A.3: Refactor TuiApp to Use Navigation + Modal Stacks

**Actions:**
- [ ] Wrap TuiAppContent with `<NavigationProvider>` using app `Routes`/`Modals`
- [ ] Remove `Mode` and UI booleans (`logsVisible`, `cliModalVisible`, etc.) in favor of nav + modal stacks
- [ ] Remove command/path/selection/focus state moved into screen params/meta
- [ ] Replace `renderContent()` switch with screen stack renderer
- [ ] Back handling: close modal if present, else `pop()` (stack never empty)
- [ ] Keyboard handlers drive `push/replace/pop` and `openModal/closeModal`

**Validation Checkpoint:**
```
✓ App launches to command select
✓ Can navigate config/running/results/error via nav stack
✓ Back closes modals first, then screens
✓ Breadcrumbs and field focus preserved via params/meta
✓ Logs/CLI/editor open as modals from any screen
✓ Legacy mode-based state removed
```

**If validation fails:** Debug navigation flow, ensure screen state persists correctly in stack. Iterate until navigation works smoothly.

---

### Task 0A.4: Update Command Execution Flow

**Actions:**
- [ ] Update run handler to `push` running screen with needed params (command, values, abort)
- [ ] On completion, `replace` with results/error screen (params carry command/values/result/error)
- [ ] Ensure re-run uses params from stack entry
- [ ] Cancellation uses back rule (modal-first, then screens) to land in the right screen

**Validation Checkpoint:**
```
✓ Running screen shows during execution
✓ Completion shows results screen, error shows error screen
✓ Back returns appropriately (immediate vs non-immediate execution)
✓ Cancellation works and leaves stack consistent
```

**If validation fails:** Fix screen transition logic in executor, iterate.

---

### Task 0A.5: Update Helper Functions

**Actions:**
- [ ] Refactor helpers (`getClipboardContent`, `statusMessage`, `shortcuts`) to read from current `ScreenEntry` and `currentModal`
- [ ] Remove mode checks; use route names and modal IDs instead
- [ ] Clipboard: when logs modal is open, copy logs; otherwise use screen params/meta

**Validation Checkpoint:**
```
✓ Clipboard content correct per screen/modal
✓ Status messages appropriate for current route
✓ Shortcuts reflect modal-first back/close behavior
✓ No mode enum references remain
```

**If validation fails:** Update helper logic, iterate.

---

## Manual Validation Guidelines

After implementing all tasks, perform comprehensive validation:

### Navigation Testing
1. Navigate through entire command hierarchy (nested subcommands)
2. Go back from each screen type (modal-first close, then screen pop)
3. Verify breadcrumbs update correctly
4. Check that field selection/focus persists via params/meta
5. Verify logs modal opens from any screen and closes before popping screens
6. Test immediate execution commands (skip config screen)

### State Management Testing
1. Verify no Mode enum references remain
2. Confirm old UI booleans removed (logs/CLI/editor visibility now via modal stack)
3. Check screen state persists in navigation stack
4. Test rapid navigation and modal stacking don’t break state
5. Verify modal-first back/escape behavior

### When Validation Fails
1. **Document the issue**: What's broken? When does it happen?
2. **Identify root cause**: State synchronization? Screen transitions?
3. **Fix implementation**: Update code to address root cause
4. **Re-test**: Repeat validation until issue resolved
5. **Document workaround**: If architectural change needed, document why

**DO NOT proceed to Phase 0B until all Phase 0A validation passes.**

---

## Benefits

**After Phase 0A completion:**
- ✅ Single source of truth (navigation stack)
- ✅ Encapsulated screen state
- ✅ Natural back navigation
- ✅ Easy to add new screens
- ✅ Screen state preserved in history
- ✅ Simpler transition logic
- ✅ Better testability (screen components isolated)
- ✅ Foundation for deep linking (serialize stack)

---

## Next Steps

1. Implement Task 0A.1 (Navigation Context)
2. Validate Task 0A.1
3. Implement Task 0A.2 (Screen Components)
4. Validate Task 0A.2
5. Continue through all tasks with validation
6. Perform comprehensive manual validation
7. **Only after all validation passes:** Proceed to [Phase 0B](./phase-0b-keyboard.md)

---

**Related:**
- [Phase 0 Overview](./README.md)
- [Problem Analysis](./problem-analysis.md)
- [Phase 0B: Keyboard](./phase-0b-keyboard.md)
- [Implementation Order](./implementation-order.md)
