# Problem Analysis: Current Architecture Issues

**Last Updated:** 2026-01-10

---

## Issue 1: Mode Management & State Explosion

### Current Implementation

The TUI application uses a `Mode` enum with 13+ interdependent state variables:

```typescript
enum Mode {
    CommandSelect,
    Config,
    Running,
    Results,
    Error,
}

// State variables in TuiRoot.tsx
const [mode, setMode] = useState<Mode>(Mode.CommandSelect);
const [selectedCommand, setSelectedCommand] = useState<AnyCommand | null>(null);
const [commandPath, setCommandPath] = useState<string[]>([]);
const [commandSelectorIndex, setCommandSelectorIndex] = useState(0);
const [selectorIndexStack, setSelectorIndexStack] = useState<number[]>([]);
const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
const [editingField, setEditingField] = useState<string | null>(null);
const [focusedSection, setFocusedSection] = useState<FocusedSection>(FocusedSection.Config);
const [logsVisible, setLogsVisible] = useState(false);
const [cliModalVisible, setCliModalVisible] = useState(false);
const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
// ... plus executor state (result, error, isExecuting)
```

### Problems

**1. State Synchronization**
- Each mode transition requires 3-7 state updates
- Easy to forget to reset a state variable
- No guaranteed consistency between related states

Example from `handleBack()`:
```typescript
if (mode === Mode.Running) {
    cancel();
    if (selectedCommand?.immediateExecution) {
        setMode(Mode.CommandSelect);
        setSelectedCommand(null);
        setCommandPath((prev) => prev.slice(0, -1));
        setSelectedFieldIndex(0);
        setFocusedSection(FocusedSection.Config);
        setLogsVisible(false);
    } else {
        setMode(Mode.Config);
        setFocusedSection(FocusedSection.Config);
    }
    resetExecutor();
}
// ... 4 more mode conditions with similar complexity
```

**2. No State Encapsulation**
- Mode-specific state lives at top level
- `commandSelectorIndex` and `selectedFieldIndex` both exist but are mode-specific
- `selectorIndexStack` only used in CommandSelect mode
- Can't easily isolate or test individual mode logic

**3. Scattered Mode Logic**
Mode-specific behavior spread across multiple functions:
- `renderContent()` - What to render
- `getClipboardContent()` - What to copy
- `statusMessage` - What to display
- `shortcuts` - What shortcuts to show
- `cycleFocusedSection()` - Which sections can be focused
- Global keyboard handler - Mode-specific input handling

**4. No Navigation History**
- Can't naturally "go back" through screens
- Manual stack management (`selectorIndexStack`) only for command hierarchy
- Can't restore previous screen state (e.g., scroll position, field selection)
- No ability to navigate forward/back through multiple result screens

**5. Difficult to Extend**
- Adding a new mode requires:
  - Adding to Mode enum
  - Adding state variables for mode-specific data
  - Updating `handleBack()` logic
  - Updating `renderContent()` switch
  - Updating all mode-aware functions
  - Updating keyboard handler conditions

---

## Issue 2: Keyboard Event Handling

### Current Implementation

Centralized priority-based handler registration:

```typescript
enum KeyboardPriority {
    Modal = 100,      // Highest - modals/overlays
    Focused = 50,     // Middle - active focused component
    Global = 0,       // Lowest - app-wide shortcuts
}

// KeyboardContext maintains flat list of handlers
const handlersRef = useRef<RegisteredHandler[]>([]);

// Components register handlers
useKeyboardHandler(handler, KeyboardPriority.Modal, { enabled: visible });
```

Event flow:
1. Single `useKeyboard()` call at app root
2. All registered handlers sorted by priority (descending)
3. Handlers invoked in order until `stopPropagation()` called
4. No relationship to component hierarchy

### Problems

**1. No Component Hierarchy**
- Flat registration doesn't reflect component tree structure
- Can't naturally bubble events up the component chain
- Parent components can't intercept unhandled keys from children

Example: ConfigForm handles up/down/enter, but if user presses 'C' (unhandled), there's no natural bubbling to parent TuiApp to show CLI modal. Instead, we need a separate global handler checking `!editingField`.

**2. Manual Focus Management**
- `focused` prop manually passed to each component
- `FocusedSection` enum tracks which section has focus
- Components must check `enabled` flag themselves
- No automatic focus inheritance or delegation

**3. Limited Priority Levels**
- Only 3 priority levels (Modal=100, Focused=50, Global=0)
- Multiple "Focused" handlers at same priority could conflict
- If ConfigForm and CommandSelector are both "focused", ordering is undefined
- No sub-priorities within a level

**4. Mode-Aware Global Handler**
Global handler has complex mode-specific logic:
```typescript
useKeyboardHandler(
    (event) => {
        // Different behavior based on mode
        if (key.name === "c" && !editingField && mode === Mode.Config) {
            setCliModalVisible(true);
        }
        if (key.name === "l" && !editingField) {
            setLogsVisible((prev) => !prev);
        }
        // ... more mode checks
    },
    KeyboardPriority.Global,
    { enabled: !editingField && !cliModalVisible }
);
```

Tight coupling to TuiApp state makes it hard to test or reuse.

**5. Handler Code Duplication**
- Up/down navigation duplicated in ConfigForm and CommandSelector
- Escape handling duplicated across modals and global handler
- No way to compose or inherit handler logic

---

## Impact Summary

### Navigation/State Issues Lead To:
- 🔴 Bug-prone state transitions
- 🔴 Difficulty adding new screens/modes
- 🔴 Poor testability
- 🔴 No navigation history
- 🔴 Complex, brittle code

### Keyboard Issues Lead To:
- 🔴 Tight coupling to app state
- 🔴 No natural event flow
- 🔴 Manual focus management
- 🔴 Handler conflicts
- 🔴 Code duplication

---

## Solutions

**Phase 0A: Stack-Based Navigation** solves navigation/state issues
- See [phase-0a-navigation.md](./phase-0a-navigation.md)

**Phase 0B: Component-Chain Keyboard** solves keyboard issues
- See [phase-0b-keyboard.md](./phase-0b-keyboard.md)

---

**Related:**
- [Phase 0 Overview](./README.md)
- [Phase 0A Tasks](./phase-0a-navigation.md)
- [Phase 0B Tasks](./phase-0b-keyboard.md)
- [Implementation Order](./implementation-order.md)
