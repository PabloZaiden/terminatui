# Migration Strategy

**Part of:** [Migration Evaluation](./README.md)

---

## Detailed Coupling Analysis

### 1. Renderer Initialization (`TuiRootlication.tsx`)

**Current Code:**
```typescript
const renderer = await createCliRenderer({
    useAlternateScreen: true,
    useConsole: false,
    exitOnCtrlC: true,
    backgroundColor: Theme.background,
    useMouse: true,
    enableMouseMovement: true,
    openConsoleOnError: false,
});

const root = createRoot(renderer);
root.render(<TuiRoot ... />);
renderer.start();
```

**New Code (with renderer factory):**
```typescript
const renderer = await createRenderer('ink', {
    alternateScreen: true,
    exitOnCtrlC: true,
    theme: Theme,
});

renderer.render(<TuiRoot ... />);
```



### 2. Keyboard Input (`KeyboardContext.tsx`)

**Current Code:**
```typescript
import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";

useKeyboard((key: KeyEvent) => {
    // Handle key
});
```

**New Code (with adapter):**
```typescript
import { useKeyboardInput } from "../adapters/keyboard.ts";
import type { KeyboardEvent } from "../semantic/types.ts";

useKeyboardInput((event: KeyboardEvent) => {
    // Handle key - normalized API
});
```



**Normalized Keyboard Event:**
```typescript
interface KeyboardEvent {
  key: string;        // e.g., 'a', 'escape', 'return'
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  sequence?: string;  // raw sequence
}
```

### 3. Scrolling (`ConfigForm.tsx`, `LogsPanel.tsx`, `ResultsPanel.tsx`)

**Current Code:**
```typescript
const scrollboxRef = useRef<ScrollBoxRenderable>(null);

useEffect(() => {
    scrollboxRef.current?.scrollTo(selectedIndex);
}, [selectedIndex]);

<scrollbox ref={scrollboxRef} scrollY={true}>
```

**New Code (with semantic ScrollView):**
```typescript
const scrollRef = useRef<ScrollViewRef>(null);

useEffect(() => {
    scrollRef.current?.scrollTo(selectedIndex);
}, [selectedIndex]);

<ScrollView ref={scrollRef} direction="vertical">
```



**Note:** In this project, Ink scrolling is currently treated as a non-goal.
- The Ink `ScrollView` adapter is an intentional no-op.
- Screens that depend heavily on scrolling should be redesigned for the line-based Ink UI style.

### 4. Input/Select Components (`EditorModal.tsx`)

**Current Code:**
```typescript
<input
    value={inputValue}
    placeholder="Enter value..."
    focused={true}
    onInput={(value) => setInputValue(value)}
    onSubmit={handleSubmit}
/>

<select
    options={options}
    selectedIndex={index}
    focused={true}
    onSelect={handleSelect}
/>
```

**New Code (with semantic components):**
```typescript
<TextInput
    value={inputValue}
    placeholder="Enter value..."
    focused={true}
    onChange={(value) => setInputValue(value)}
    onSubmit={handleSubmit}
/>

<Select
    options={options}
    selectedIndex={index}
    focused={true}
    onSelect={handleSelect}
/>
```



**Note:** Ink has `ink-text-input` and `ink-select-input` libraries.

### 5. Layout Components (All components)

**Current Code:**
```typescript
<box flexDirection="column" flexGrow={1} padding={1}>
    <box border={true} borderStyle="rounded" borderColor={color}>
        <text fg={Theme.label}>Hello</text>
    </box>
</box>
```

**New Code (with semantic components):**
```typescript
<Container direction="column" flex padding={1}>
    <Panel border="rounded" borderColor={color}>
        <Label color="label">Hello</Label>
    </Panel>
</Container>
```



### 6. Theme System

**Current Code:**
```typescript
export const Theme = {
    background: "#1e2127",
    border: "#3e4451",
    borderFocused: "#61afef",
    // ... direct colors
};

<text fg={Theme.label}>
```

**New Code (with semantic theme):**
```typescript
export const Theme = {
    colors: {
        background: "#1e2127",
        border: "#3e4451",
        // ...
    },
    // Maps semantic colors to theme colors
    semantic: {
        label: "label",
        value: "value",
        error: "error",
        // ...
    }
};

<Label color="label">  // Semantic reference
```



---
