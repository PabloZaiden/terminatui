# Current State Analysis

**Part of:** [Migration Evaluation](./README.md)

---

## Current State Analysis

### OpenTUI Coupling Points

The codebase has **6 direct coupling points** with OpenTUI:

| File | OpenTUI Dependency | Usage | Complexity |
|------|-------------------|-------|------------|
| `TuiApplication.tsx` | `createCliRenderer`, `createRoot` | Renderer initialization | **High** |
| `KeyboardContext.tsx` | `useKeyboard`, `KeyEvent` | Keyboard input handling | **High** |
| `ConfigForm.tsx` | `ScrollBoxRenderable` | Scroll ref type | **Low** |
| `EditorModal.tsx` | `SelectOption` | Dropdown option type | **Low** |
| `tsconfig.json` | `jsxImportSource` | JSX transformation | **Low** |
| `package.json` | `@opentui/react` | Dependency | **Trivial** |

### OpenTUI JSX Primitives Used

The codebase uses **7 OpenTUI primitives**:

1. **`<box>`** - Layout container (flexbox model) - Used extensively (~50+ instances)
2. **`<text>`** - Text rendering with color/style - Used extensively (~80+ instances)
3. **`<scrollbox>`** - Scrollable container - Used in 5 components
4. **`<select>`** - Dropdown/list selection - Used in `EditorModal`
5. **`<input>`** - Text input field - Used in `EditorModal`
6. **`<span>`** - Inline text styling - Used in `JsonHighlight`
7. **Ref types** - `ScrollBoxRenderable` - Used for programmatic scrolling

### Stability Issues with OpenTUI

Based on reported issues:

1. **Terminal compatibility:** Poor copy/paste and mouse handling
2. **Reliability:** Occasional crashes
3. **Distribution:** Binary dependencies create cross-platform challenges
4. **Maturity:** New and unstable codebase (v0.1.68)

---

## Proposed Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│  Application Layer (User Code)                      │
│  - Command definitions                              │
│  - Custom renderResult() implementations            │
│  - No changes required                              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Framework Layer (TerminaTUI Public API)            │
│  - TuiApplication                                   │
│  - Hooks (useKeyboardHandler, useClipboard, etc.)   │
│  - Minimal changes (renderer initialization)        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Semantic Component Library (NEW)                   │
│  - Layout: <Panel>, <Container>, <Stack>            │
│  - Content: <Label>, <Value>, <Code>                │
│  - Interactive: <Field>, <Button>, <Modal>          │
│  - Behavior: focus, scroll, keyboard                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Renderer Adapter (Swappable)                       │
│  - OpenTUI Adapter (current)                        │
│  - Ink Adapter (new)                                │
└─────────────────────────────────────────────────────┘
```

### Semantic Component Library Design

#### Core Principles

1. **Renderer-agnostic:** Components describe intent, not implementation
2. **Complete abstraction:** Layout, colors, behaviors, scrolling all abstracted
3. **Minimal API surface:** Only components actually used by the framework
4. **Type-safe:** Full TypeScript support with proper types

#### Component Inventory

Based on current usage analysis, we need **12 semantic components**:

##### Layout Components
- **`<Panel>`** - Bordered container with title, focus states
- **`<Container>`** - Flexbox layout (replaces `<box>`)
- **`<ScrollView>`** - Scrollable content area
- **`<Overlay>`** - Absolute positioned modal overlay

##### Content Components
- **`<Label>`** - Styled text (headers, labels, descriptions)
- **`<Value>`** - Display values (numbers, strings, JSON)
- **`<Code>`** - Monospace code/command display
- **`<CodeHighlight>`** - Syntax-highlighted code

##### Interactive Components
- **`<Field>`** - Form field row (label + value + selection state)
- **`<TextInput>`** - Single-line text input
- **`<Select>`** - Option picker (dropdown/list)
- **`<Button>`** - Action button

#### Example Component API

```typescript
// Panel - bordered container with focus
interface PanelProps {
  title?: string;
  focused?: boolean;
  children: ReactNode;
  flex?: boolean; // flexGrow
  height?: number;
}

// ScrollView - scrollable container
interface ScrollViewProps {
  children: ReactNode;
  direction?: 'vertical' | 'horizontal';
  stickyToEnd?: boolean; // for logs
  focused?: boolean; // enables keyboard scrolling
  ref?: ScrollViewRef; // programmatic scroll
}

// Field - form field with selection
interface FieldProps {
  label: string;
  value: string;
  selected?: boolean;
  onActivate?: () => void;
}

// TextInput - text field
interface TextInputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
  onSubmit: (value: string) => void;
  onChange: (value: string) => void;
}
```

### Keyboard Handling Strategy

Both OpenTUI and Ink have different keyboard models:

| Aspect | OpenTUI | Ink | Migration |
|--------|---------|-----|-----------|
| Hook | `useKeyboard()` | `useInput()` | Create adapter hook |
| Event type | `KeyEvent` | `(input, key)` | Normalize to common type |
| Priority | Custom system | Component-based | Keep custom priority system |
| Modal capture | Event propagation | Focus management | Implement in semantic layer |

**Solution:** Create `useKeyboardInput()` adapter that wraps the renderer's keyboard API and provides our priority-based system.

---
