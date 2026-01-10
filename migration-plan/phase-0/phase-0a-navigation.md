# Phase 0A: Stack-Based Navigation

**Last Updated:** 2026-01-10  
**Status:** Ready for Implementation

---

## Goal

Replace mode-based state management with a navigation stack that encapsulates screen-specific state and provides natural back/forward navigation.

---

## Proposed Solution

### 1. Screen Type Union

Define discriminated union for all application screens:

```typescript
type Screen =
    | { 
        type: 'command-select';
        index: number;
        path: string[];
      }
    | { 
        type: 'config';
        command: AnyCommand;
        path: string[];
        values: Record<string, unknown>;
        fieldIndex: number;
        focusedSection: 'config' | 'logs';
        logsVisible: boolean;
      }
    | { 
        type: 'running';
        command: AnyCommand;
        path: string[];
        values: Record<string, unknown>;
      }
    | { 
        type: 'results';
        command: AnyCommand;
        path: string[];
        values: Record<string, unknown>;
        result: unknown;
        focusedSection: 'results' | 'logs';
        logsVisible: boolean;
      }
    | { 
        type: 'error';
        command: AnyCommand;
        path: string[];
        values: Record<string, unknown>;
        error: Error;
        focusedSection: 'results' | 'logs';
        logsVisible: boolean;
      }
    | {
        type: 'editor-modal';
        field: string;
        fieldType: 'text' | 'number' | 'boolean' | 'enum';
        value: unknown;
        options?: unknown[];
        parentScreen: Screen;
      }
    | {
        type: 'cli-modal';
        command: string;
        parentScreen: Screen;
      };
```

**Benefits:**
- Each screen encapsulates its own state
- TypeScript ensures all required data is present
- Parent screen preserved for modals (enables proper back navigation)
- Path included in each screen (breadcrumb support)

### 2. Navigation API

```typescript
interface NavigationAPI {
    /** Current screen */
    current: Screen;
    
    /** Push new screen onto stack */
    push: (screen: Screen) => void;
    
    /** Pop current screen and return to previous */
    pop: () => void;
    
    /** Replace current screen without adding to history */
    replace: (screen: Screen) => void;
    
    /** Reset stack to initial screen */
    reset: () => void;
    
    /** Can go back? */
    canGoBack: boolean;
}
```

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

**Opening a modal:**
```typescript
// Old way
setEditingField(fieldName);
// Field editing state scattered in EditorModal

// New way
push({
    type: 'editor-modal',
    field: fieldName,
    fieldType: 'text',
    value: currentValue,
    parentScreen: navigation.current,
});
```

---

## Implementation Tasks

### Task 0A.1: Create Navigation Context

**Actions:**
- [ ] Create `src/tui/context/NavigationContext.tsx`
- [ ] Define `Screen` type union with all screen types
- [ ] Define `NavigationAPI` interface
- [ ] Implement `NavigationProvider` component
- [ ] Use `useState<Screen[]>` for stack storage
- [ ] Implement push/pop/replace/reset methods
- [ ] Export `useNavigation()` hook

**Validation Checkpoint:**
```
✓ Context can be imported and used
✓ TypeScript types are correct
✓ Push/pop operations work in isolation
✓ Stack never becomes empty (reset to initial screen)
```

**If validation fails:** Iterate on API design until clean and type-safe.

---

### Task 0A.2: Create Screen Components

**Actions:**
- [ ] Create `src/tui/screens/` directory
- [ ] Create `CommandSelectScreen.tsx`
  - [ ] Extract logic from current CommandSelector usage
  - [ ] Accept screen props and navigation API
  - [ ] Handle command selection → push config screen
- [ ] Create `ConfigScreen.tsx`
  - [ ] Extract logic from current Config mode rendering
  - [ ] Manage field selection, logs visibility, focused section
  - [ ] Handle run → push running screen
  - [ ] Handle CLI button → push cli-modal screen
- [ ] Create `RunningScreen.tsx`
  - [ ] Show logs panel
  - [ ] Handle completion → replace with results/error screen
- [ ] Create `ResultsScreen.tsx`
  - [ ] Show results panel and optional logs
  - [ ] Handle focus cycling
- [ ] Create `ErrorScreen.tsx`
  - [ ] Show error panel and optional logs
  - [ ] Similar to results but for errors
- [ ] Create `EditorModalScreen.tsx`
  - [ ] Render editor modal overlay
  - [ ] Handle save → pop with updated value
  - [ ] Handle cancel → pop without changes
- [ ] Create `CliModalScreen.tsx`
  - [ ] Render CLI command modal overlay
  - [ ] Handle close → pop

**Validation Checkpoint:**
```
✓ Each screen component renders correctly in isolation
✓ Screen components accept screen props properly
✓ Navigation calls work (push/pop from within screens)
✓ No TypeScript errors
```

**If validation fails:** Fix screen component logic and props, iterate until working.

---

### Task 0A.3: Refactor TuiApp to Use Navigation Stack

**Actions:**
- [ ] Wrap TuiAppContent with `<NavigationProvider>`
- [ ] Remove `mode` state variable
- [ ] Remove `selectedCommand` state variable
- [ ] Remove `commandPath` state variable
- [ ] Remove `commandSelectorIndex` state variable
- [ ] Remove `selectorIndexStack` state variable
- [ ] Remove `selectedFieldIndex` state variable
- [ ] Remove `editingField` state variable
- [ ] Remove `focusedSection` state variable
- [ ] Remove `logsVisible` state variable
- [ ] Remove `cliModalVisible` state variable
- [ ] Keep `configValues` temporarily (or move to config screen state)
- [ ] Replace `renderContent()` switch with screen stack renderer
- [ ] Simplify `handleBack()` to just `navigation.pop()`
- [ ] Update keyboard handlers to use current screen type

**Validation Checkpoint:**
```
✓ App launches to command select screen
✓ Can select command and navigate to config
✓ Can go back from config to command select
✓ Field index preserved when navigating away and back
✓ Command path shown correctly in breadcrumbs
✓ Logs toggle works in appropriate screens
✓ Modals open and close correctly
✓ All 13 state variables removed
```

**If validation fails:** Debug navigation flow, ensure screen state persists correctly in stack. Iterate until navigation works smoothly.

---

### Task 0A.4: Update Command Execution Flow

**Actions:**
- [ ] Update run command handler to push running screen
- [ ] Pass abort controller to running screen
- [ ] On completion, replace running screen with results/error screen
- [ ] Ensure command/values available in results screen for re-run
- [ ] Test cancellation returns to config screen

**Validation Checkpoint:**
```
✓ Running command shows running screen
✓ Completion shows results screen
✓ Error shows error screen
✓ Back from results returns to config (if not immediate execution)
✓ Back from results returns to command select (if immediate execution)
✓ Cancellation works correctly
```

**If validation fails:** Fix screen transition logic in executor, iterate.

---

### Task 0A.5: Update Helper Functions

**Actions:**
- [ ] Refactor `getClipboardContent()` to use current screen
- [ ] Refactor `statusMessage` to use current screen
- [ ] Refactor `shortcuts` to use current screen
- [ ] Remove mode checks, use screen type instead

**Validation Checkpoint:**
```
✓ Clipboard content correct for each screen type
✓ Status messages appropriate for current screen
✓ Keyboard shortcuts displayed correctly per screen
✓ No mode enum references remain
```

**If validation fails:** Update helper logic, iterate.

---

## Manual Validation Guidelines

After implementing all tasks, perform comprehensive validation:

### Navigation Testing
1. Navigate through entire command hierarchy (nested subcommands)
2. Go back from each screen type
3. Verify breadcrumbs update correctly
4. Check that field selection persists when navigating back
5. Verify logs panel state preserved
6. Test immediate execution commands (skip config screen)

### State Management Testing
1. Verify no Mode enum references remain
2. Confirm all 13 state variables removed
3. Check screen state persists in navigation stack
4. Test rapid navigation doesn't break state
5. Verify modals preserve parent screen state

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
