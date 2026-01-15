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
12. Update `TuiRoot.tsx` to use semantic components
13. Update keyboard handlers to use adapter

**Validation:**
- Run example app with OpenTUI - should work identically
- All existing functionality preserved
- No visual regressions

### Phase 3: Implement Ink Adapter (Line-Based)

**Goal:** Provide an Ink renderer option for the semantic TUI layer, using a line-based terminal UI style (minimal decoration, no border/overlay parity).

**Tasks:**
1. Add Ink dependencies (`ink`, plus minimal input widgets)
2. Implement Ink renderer class
3. Implement semantic components for Ink (minimal/no-op where appropriate)
4. Implement Ink keyboard adapter (`useInput`)
5. Wire renderer selection (`--renderer ink|opentui`)
6. Integration testing with full app

**Key Differences (Intentional):**

| Feature | OpenTUI | Ink | Strategy |
|---------|---------|-----|----------|
| Layout | Strong layout primitives | Limited/line-first | Prefer plain text + simple flex |
| Scrolling | Built-in `<scrollbox>` | Not a core goal here | Ink `ScrollView` can be a no-op |
| Borders/Boxes | Common UI pattern | Possible but discouraged | Avoid borders as a design convention |
| Overlays | True overlays | Not really | Don’t try to visually stack modals |
| Colors | Direct hex/names | `chalk`/Ink styling | Keep mapping simple and readable |
| Keyboard | `useKeyboard()` | `useInput()` | Normalize into shared keyboard events |

### Phase 4: Dual-Renderer Cutover

**Goal:** Ship Ink as a supported renderer while keeping OpenTUI.

**Tasks:**
1. Finalize renderer selection API (default + override)
2. Document how to choose renderer per app
3. Validate parity for core flows on both renderers
4. Update examples/CI to exercise both renderers
5. Optional: performance notes and known-differences doc

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
