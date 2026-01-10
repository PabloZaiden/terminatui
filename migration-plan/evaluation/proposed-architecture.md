# Proposed Architecture

**Part of:** [Migration Evaluation](./README.md)

---

## Proposed Architecture

### Phase 1: Create Semantic Component Library (OpenTUI Implementation)

**Goal:** Build abstraction layer using OpenTUI as initial renderer

**Tasks:**
1. Create semantic component definitions (`src/tui/semantic/`)
2. Implement OpenTUI adapter components
3. Create keyboard input adapter
4. Update theme system for semantic colors
5. Add renderer interface and factory

**Deliverables:**
- New directory structure: `src/tui/semantic/` and `src/tui/adapters/opentui/`
- All semantic components implemented
- Keyboard adapter working
- Tests for semantic components

**Directory Structure:**
```
src/tui/
├── semantic/
│   ├── components/
│   │   ├── Panel.tsx
│   │   ├── Container.tsx
│   │   ├── ScrollView.tsx
│   │   ├── Overlay.tsx
│   │   ├── Label.tsx
│   │   ├── Value.tsx
│   │   ├── Code.tsx
│   │   ├── CodeHighlight.tsx
│   │   ├── Field.tsx
│   │   ├── TextInput.tsx
│   │   ├── Select.tsx
│   │   └── Button.tsx
│   ├── types.ts
│   └── index.ts
├── adapters/
│   ├── types.ts          # Renderer interface
│   ├── opentui/
│   │   ├── OpenTUIRenderer.tsx
│   │   ├── components/   # OpenTUI implementations
│   │   └── keyboard.ts
│   └── ink/              # Phase 2
│       ├── InkRenderer.tsx
│       ├── components/
│       └── keyboard.ts
├── components/           # Existing - refactor to use semantic
├── hooks/               # Existing - may need keyboard updates
└── TuiApplication.tsx   # Update to use renderer factory
```

### Phase 2: Refactor Existing Components

**Goal:** Update all existing TUI components to use semantic layer

**Tasks:**
1. Refactor `Header.tsx` to use semantic components
2. Refactor `StatusBar.tsx`
3. Refactor `ConfigForm.tsx`
4. Refactor `CommandSelector.tsx`
5. Refactor `EditorModal.tsx`
6. Refactor `CliModal.tsx`
7. Refactor `LogsPanel.tsx`
8. Refactor `ResultsPanel.tsx`
9. Refactor `FieldRow.tsx`
10. Refactor `ActionButton.tsx`
11. Refactor `JsonHighlight.tsx`
12. Update `TuiApp.tsx` to use semantic components
13. Update keyboard handlers to use adapter

**Validation:**
- Run example app with OpenTUI - should work identically
- All existing functionality preserved
- No visual regressions

### Phase 3: Implement Ink Adapter

**Goal:** Create Ink renderer implementation

**Tasks:**
1. Add Ink dependencies (`ink`, `ink-scroll-view`)
2. Implement Ink renderer class
3. Implement all 12 semantic components for Ink
4. Implement Ink keyboard adapter
5. Handle scrolling with `ink-scroll-view`
6. Test each component in isolation
7. Integration testing with full app

**Key Differences to Handle:**

| Feature | OpenTUI | Ink | Implementation Strategy |
|---------|---------|-----|------------------------|
| Layout | Native flexbox | Yoga layout | Map flexbox props directly |
| Scrolling | Built-in `<scrollbox>` | `ink-scroll-view` library | Wrap in semantic `<ScrollView>` |
| Borders | `border={true}` | Built-in on `<Box>` (v6) | Use Ink's native borders |
| Titled Borders | `title` prop | `@rwirnsberger/ink-titled-box` | Use library for titled panels |
| Colors | Direct hex/names | `chalk` colors | Map theme colors to chalk |
| Keyboard | `useKeyboard()` | `useInput()`/`useFocus()` | Adapter hook |
| Mouse | Built-in | `useStdin()` | Optional - not critical |
| Refs | `ScrollBoxRenderable` | `ref` forwarding | Normalize ref interface |

### Phase 4: Migration Cutover

**Goal:** Switch default renderer to Ink, remove OpenTUI

**Tasks:**
1. Update `TuiApplication` to default to Ink renderer
2. Update `package.json` - remove `@opentui/react`, add Ink deps
3. Update `tsconfig.json` - change `jsxImportSource` to `react`
4. Remove OpenTUI adapter code
5. Update documentation
6. Test both example apps thoroughly
7. Performance testing and optimization

**Testing Plan:**
- Run example TUI app end-to-end
- Test all keyboard shortcuts
- Test all modals (CLI, Editor)
- Test scrolling in logs and results
- Test field navigation and editing
- Test command execution and cancellation
- Test clipboard operations
- Cross-platform testing (macOS, Linux, Windows WSL)

---
