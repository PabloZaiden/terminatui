# Phase 0B: Component-Chain Keyboard Handling

**Last Updated:** 2026-01-12  
**Status:** ⏸️ NOT PLANNED FOR NOW  
**Prerequisites:** Phase 0A navigation stack and modal-first back handling completed; storyboard validated

---

## Decision: Deferred

Phase 0B has been evaluated and **deferred** as part of the Phase 0A refactoring. The current keyboard architecture is sufficient for the migration to proceed.

### What Was Originally Planned

Replace flat priority-based keyboard handling with component hierarchy-aware bubbling (focus tree) that mirrors the component tree structure.

### What Was Actually Implemented (in Phase 0A)

A simpler **stack-based active handler** model:

```
Global Handler (TuiApp)
    ↓ (if not handled)
Active Handler (topmost screen/modal in stack)
```

- **`useGlobalKeyHandler`**: App-wide shortcuts (Esc, Ctrl+Y, Ctrl+L) processed first
- **`useActiveKeyHandler`**: Screen/modal registers as active handler; stack-based so modals automatically take precedence
- **No priority conflicts**: Most recent handler wins
- **No mode checks**: Global handler is truly global; screens handle their own logic

### Why This Is Sufficient

| Original Problem | Current Status |
|------------------|----------------|
| Mode-aware global handler with complex logic | ✅ **SOLVED** - Global handler only handles 3 shortcuts, no mode checks |
| Priority-based conflicts | ✅ **SOLVED** - Stack model means topmost handler wins |
| Manual focus management | ✅ **SOLVED** - Handlers auto-register via hooks |
| No component hierarchy bubbling | ⚠️ **NOT NEEDED** - Screens are leaf nodes for keyboard; no deep nesting |

### Why Bubbling Isn't Needed Now

1. **Screens handle all their keys** - Each screen (CommandSelect, Config, Running, etc.) handles its own keyboard shortcuts in one place
2. **No deeply nested keyboard components** - There are no child components within screens that need independent keyboard handling with bubbling
3. **Modals work correctly** - Modal stack ensures modals capture keys; global shortcuts still work via the global handler
4. **Complexity not justified** - Building a full focus tree adds significant complexity for minimal benefit

### When To Revisit

Consider implementing Phase 0B if:
- Screens become complex with nested components needing independent keyboard handling
- Reusable form components need to handle Tab/Enter while letting parent screens handle other shortcuts
- Editor modal gets complex with multiple focusable input areas

### Current Keyboard Architecture Summary

```typescript
// Global handler (TuiApp only)
useGlobalKeyHandler((event) => {
    if (key.name === "escape") { goBack(); return true; }
    if (key.ctrl && key.name === "y") { copy(); return true; }
    if (key.ctrl && key.name === "l") { toggleLogs(); return true; }
    return false; // Let active handler process
});

// Active handler (screens/modals)
useActiveKeyHandler((event) => {
    // Handle screen-specific keys
    if (event.key.name === "return") { onSelect(); return true; }
    return false;
}, { enabled: visible });
```

---

## Original Proposal (For Reference)

The following sections document the original Phase 0B proposal, preserved for future reference if this work is revisited.

---

## Original Goal

Replace flat priority-based keyboard handling with component hierarchy-aware bubbling that mirrors the component tree structure.

---

## Original Proposed Solution

### 1. Focus Tree Concept

Each component can be **focusable** and register keyboard handlers. The focus tree reflects the component hierarchy:

---

## Proposed Solution

### 1. Focus Tree Concept

Each component can be **focusable** and register keyboard handlers. The focus tree reflects the component hierarchy:

```
TuiApp (root)
└── ConfigScreen
    ├── ConfigForm (focused)
    │   ├── FieldRow (selected)
    │   │   └── [handles: enter, up, down]
    │   └── [handles: tab, escape]
    └── [handles: c (CLI), l (logs), y (copy)]
```

When a key is pressed:
1. Event sent to deepest focused component (FieldRow)
2. If not handled, bubble to parent (ConfigForm)
3. If not handled, bubble to parent (ConfigScreen)
4. If not handled, bubble to parent (TuiApp)
5. Stop when handled or reach root

### 2. Keyboard Context Redesign

```typescript
interface KeyboardHandler {
    /** Handle keyboard event, return true if handled */
    handle: (event: KeyEvent) => boolean;
}

interface FocusNode {
    id: string;
    handler: KeyboardHandler;
    parent: FocusNode | null;
    children: FocusNode[];
}

interface KeyboardContextValue {
    /** Register component in focus tree */
    registerFocusable: (
        id: string,
        handler: KeyboardHandler,
        parentId: string | null
    ) => void;
    
    /** Unregister component */
    unregisterFocusable: (id: string) => void;
    
    /** Set which component has focus */
    setFocus: (id: string) => void;
    
    /** Get currently focused component ID */
    focusedId: string | null;
}
```

### 3. Handler API

Components register handlers that return boolean:

```typescript
// ConfigForm.tsx
const { registerFocusable, setFocus } = useKeyboardContext();

useEffect(() => {
    registerFocusable(
        'config-form',
        {
            handle: (event) => {
                if (event.key.name === 'tab') {
                    // Cycle through fields
                    cycleFocusedSection();
                    return true; // Handled
                }
                if (event.key.name === 'escape') {
                    // Go back
                    navigation.pop();
                    return true;
                }
                return false; // Not handled, bubble to parent
            }
        },
        'config-screen' // Parent ID
    );
    
    // Set focus when component mounts
    setFocus('config-form');
    
    return () => unregisterFocusable('config-form');
}, []);
```

### 4. Modal Capture

Modals sit on top of the modal stack and register as root-level focusables while visible. They should consume only the keys they actually handle (escape/enter/submit/etc.), and let unhandled keys bubble so global shortcuts (e.g., copy) can still work when appropriate.

```typescript
// EditorModal.tsx
useEffect(() => {
    if (visible) {
        registerFocusable('editor-modal', handler, null); // root-level
        setFocus('editor-modal');
    }
    return () => unregisterFocusable('editor-modal');
}, [visible]);

const handled = handler.handle(event);
// Return true only when actually handled; else false to bubble to app/global
```

---

## Implementation Tasks

### Task 0B.1: Update KeyboardContext for Hierarchy

**Actions:**
- [ ] Redefine `KeyboardHandler` interface with boolean return
- [ ] Create `FocusNode` type to represent tree structure
- [ ] Update `KeyboardContextValue` interface
- [ ] Implement focus tree storage in `KeyboardProvider`
- [ ] Implement `registerFocusable()` method
- [ ] Implement `unregisterFocusable()` method
- [ ] Implement `setFocus()` method
- [ ] Update root `useKeyboard()` to traverse focus tree on key press
- [ ] Implement bubbling logic (start at focused node, go up until handled)
- [ ] Remove old priority-based registration system

**Validation Checkpoint:**
```
✓ Focus tree builds correctly as components mount
✓ Focus tree cleans up as components unmount
✓ setFocus() changes focused node
✓ Key events bubble from focused node to root
✓ Bubbling stops when handler returns true
✓ No TypeScript errors
```

**If validation fails:** Debug focus tree structure and bubbling logic, iterate.

---

### Task 0B.2: Create useKeyboardHandler Hook

**Actions:**
- [ ] Reimplement `useKeyboardHandler` hook
- [ ] Accept handler function returning boolean
- [ ] Accept parent component ID (or null for root-level)
- [ ] Generate stable component ID (or accept explicit ID)
- [ ] Call `registerFocusable()` on mount
- [ ] Call `unregisterFocusable()` on unmount
- [ ] Optionally call `setFocus()` on mount (auto-focus prop)
- [ ] Handle dependency updates without unregistering

**Validation Checkpoint:**
```
✓ Hook can be used in components
✓ Handlers register/unregister correctly
✓ Parent-child relationships established correctly
✓ Auto-focus works when enabled
✓ Stable across re-renders
```

**If validation fails:** Fix hook implementation, iterate.

---

### Task 0B.3: Update TuiApp Global Handlers

**Actions:**
- [ ] Remove mode-aware global keyboard handler
- [ ] Create TuiApp-level handler (registered as root)
- [ ] Handle app-wide shortcuts (escape to exit at root level; copy uses currentModal→current screen data)
- [ ] Remove `enabled` flags and mode checks
- [ ] Simplify to only handle truly global shortcuts

**Validation Checkpoint:**
```
✓ App-level shortcuts work (escape to exit at top level)
✓ Global copy works regardless of modal visibility (modal content first, else screen)
✓ No mode-specific logic in TuiApp handler
✓ Handlers in screens receive events first
```

**If validation fails:** Adjust handler logic, iterate.

---

### Task 0B.4: Update Screen Component Handlers

**Actions:**
- [ ] Update CommandSelectScreen keyboard handler
  - [ ] Handle up/down/enter
  - [ ] Return true when handled, false otherwise
  - [ ] Register with screen ID as parent
- [ ] Update ConfigScreen keyboard handler
  - [ ] Handle screen-level shortcuts (c for CLI, l for logs)
  - [ ] Let field navigation bubble from ConfigForm
  - [ ] Return false for unhandled keys
- [ ] Update RunningScreen keyboard handler
  - [ ] Handle cancellation
  - [ ] Handle copy logs
- [ ] Update ResultsScreen keyboard handler
  - [ ] Handle focus cycling
  - [ ] Handle copy results/logs
- [ ] Update ErrorScreen keyboard handler
  - [ ] Similar to results

**Validation Checkpoint:**
```
✓ Each screen handles its own shortcuts
✓ Unhandled keys bubble to parent (TuiApp)
✓ Screen-specific shortcuts work correctly
✓ No handler conflicts or duplicates
```

**If validation fails:** Adjust screen handlers, iterate.

---

### Task 0B.5: Update Form and Modal Component Handlers

**Actions:**
- [ ] Update ConfigForm handler
  - [ ] Handle tab (field cycling)
  - [ ] Handle up/down (field navigation)
  - [ ] Handle enter (edit field)
  - [ ] Register with ConfigScreen as parent
  - [ ] Return true only for handled keys
- [ ] Update CommandSelector handler
  - [ ] Handle up/down/enter
  - [ ] Register with CommandSelectScreen as parent
- [ ] Update EditorModal handler
  - [ ] Register as root-level (parentId: null) for capture
  - [ ] Handle escape/enter/submit; let unhandled keys bubble (so global copy/back can run)
- [ ] Update CliModal handler
  - [ ] Register as root-level for capture
  - [ ] Handle escape/enter/y; let unhandled keys bubble

**Validation Checkpoint:**
```
✓ Form navigation works correctly
✓ Field selection works
✓ Enter opens editor modal
✓ Modal captures needed keys but allows unhandled to bubble (global copy/back still work)
✓ Closing modal restores focus to previous component
✓ No duplicate handler registrations
```

**If validation fails:** Fix component handlers and focus management, iterate.

---

### Task 0B.6: Remove Old Priority System

**Actions:**
- [ ] Remove `KeyboardPriority` enum
- [ ] Remove priority-based sorting in KeyboardContext
- [ ] Remove `enabled` prop from hooks (use conditional registration instead)
- [ ] Remove `modal` prop from hooks (use parentId: null instead)
- [ ] Update all imports
- [ ] Verify no references to old API remain

**Validation Checkpoint:**
```
✓ All old priority references removed
✓ No TypeScript errors
✓ Build succeeds
✓ All keyboard handling uses new bubbling system
```

**If validation fails:** Find remaining references, update them, iterate.

---

## Manual Validation Guidelines

After implementing all tasks, perform comprehensive validation:

### Keyboard Testing
1. Test each keyboard shortcut in each screen
2. Verify modal input capture (background shouldn't respond to handled keys)
3. Test field navigation (up/down/tab)
4. Verify focus indicators visible and correct
5. Test unhandled keys bubble correctly (e.g., 'c' from field → screen handler)
6. Test copy shortcut with and without modal open (modal content first, else screen)

### Focus Tree Testing
1. Verify focus tree structure matches component hierarchy
2. Test focus changes when navigating between screens
3. Verify modal capture blocks background handlers
4. Test focus restoration after modal closes
5. Check no orphaned handlers remain after unmount

### Integration Testing
1. **Smoke Test**: All keyboard shortcuts work correctly
2. **Modal Test**: Open/close all modals with keyboard
3. **Navigation Test**: Navigate entire app with keyboard only
4. **Edge Cases**: Rapid key presses, simultaneous handlers, focus conflicts

### When Validation Fails
1. **Document the issue**: What's broken? When does it happen?
2. **Identify root cause**: Focus tree? Bubbling? Handler registration?
3. **Fix implementation**: Update code to address root cause
4. **Re-test**: Repeat validation until issue resolved
5. **Document workaround**: If architectural change needed, document why

**Note:** Phase 0B is currently **deferred**. Proceeding with Phase 1+ is OK as long as the existing keyboard model remains sufficient.

---

## Benefits

**After Phase 0B completion:**
- ✅ Natural event bubbling mirrors component tree
- ✅ Parent components handle unhandled child events
- ✅ No mode-aware global handlers
- ✅ Focus management reflects component hierarchy
- ✅ Modal capture simplified (root-level registration)
- ✅ Handler composition through bubbling
- ✅ Easier to test (components handle own keys)
- ✅ No handler priority conflicts

---

## Next Steps

1. Keep Phase 0B as reference (no action required)
2. Proceed with renderer migration phases (Phase 1 → Phase 2 → Phase 3)
3. Revisit Phase 0B only if keyboard handling needs outgrow the current model

---

**Related:**
- [Phase 0 Overview](./README.md)
- [Problem Analysis](./problem-analysis.md)
- [Phase 0A: Navigation](./phase-0a-navigation.md)
- [Implementation Order](./implementation-order.md)
