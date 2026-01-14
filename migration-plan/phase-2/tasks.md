## Phase 2: Refactor Existing Components to Use Semantic Layer

**Goal:** Update all existing TUI components to use the new semantic component library instead of OpenTUI primitives directly.

**Deliverables:**
- All 13 component files refactored
- TuiApp.tsx using semantic components
- TuiApplication.tsx using renderer factory
- Keyboard handlers using keyboard adapter
- Full application working with semantic layer

### Task 2.1: Refactor Simple Components (Mostly Done)

**Description:** Start with components that have no dependencies on other components.

**Components:** FieldRow, ActionButton, Header, StatusBar

**Actions:**
- [ ] Refactor `FieldRow.tsx`
  - [ ] Replace `<box>` with `<Container>`
  - [ ] Replace `<text>` with `<Label>` and `<Value>`
  - [ ] Use semantic colors
  - [ ] Test rendering
- [ ] Refactor `ActionButton.tsx`
  - [ ] Replace `<box>` with `<Container>`
  - [ ] Replace `<text>` with `<Button>` semantic component
  - [ ] Use semantic colors for selection state
  - [ ] Test button interaction
- [x] Refactor `Header.tsx`
  - [ ] Replace `<box>` with `<Container>`
  - [ ] Replace `<text>` with `<Label>`
  - [ ] Use semantic layout props
  - [ ] Test breadcrumb rendering
- [x] Refactor `StatusBar.tsx`
  - [ ] Replace `<box>` with `<Container>` and `<Panel>`
  - [ ] Replace `<text>` with `<Label>`
  - [ ] Update spinner integration
  - [ ] Test running state display

**Validation:**
- Each component renders identically to before
- No visual regressions
- Props work the same

### Task 2.2: Refactor JsonHighlight Component

**Description:** Port JSON highlighting to use CodeHighlight semantic component.

**Actions:**
- [ ] Update `JsonHighlight.tsx`
  - [ ] Use `<CodeHighlight>` semantic component
  - [ ] Ensure token coloring matches theme
  - [ ] Test JSON rendering with various data types
  - [ ] Verify nested object/array rendering

**Validation:**
- JSON syntax highlighting works correctly
- Colors match theme
- Performance is acceptable for large JSON

### Task 2.3: Refactor Modal Components

**Description:** Update modals to use Overlay semantic component.

**Components:** EditorModal, CliModal, Logs (modal)

**Actions:**
- [ ] Refactor `EditorModal.tsx`
  - [ ] Replace `<box>` with `<Overlay>`
  - [ ] Use `<TextInput>` and `<Select>` semantic components
  - [ ] Use `<Panel>` for modal container
  - [ ] Update keyboard handler to use adapter (consume handled keys; unhandled falls through to global shortcuts like copy)
  - [ ] Test enum/boolean/text editing
- [ ] Refactor `CliModal.tsx`
  - [ ] Replace `<box>` with `<Overlay>`
  - [ ] Use `<ScrollView>` for horizontal scrolling
  - [ ] Use `<Code>` for command display
  - [ ] Update keyboard handler (same stack/global fall-through guidance)
  - [ ] Test command display and copy
- [ ] Implement `Logs` modal using semantic Overlay + ScrollView (replaces LogsPanel)
  - [ ] Sticky to end, colorized lines
  - [ ] Keyboard handler: close on escape/enter/l; copy logs; let unhandled bubble

**Validation:**
- Modals overlay correctly
- Input components work
- Keyboard shortcuts functional (modal-first, unhandled bubble)
- Modals can be dismissed; copy works in modals

### Task 2.4: Refactor Panel Components

**Description:** Update components that use scrolling and complex layouts.

**Components:** ResultsPanel (logs now modal-based)

**Actions:**
- [ ] Refactor `ResultsPanel.tsx`
  - [ ] Replace `<box>` with `<Panel>`
  - [ ] Use `<ScrollView>` for results
  - [ ] Use semantic content components
  - [ ] Support custom renderResult
  - [ ] Test with various result types
  - [ ] Test error display

**Validation:**
- Scrolling works smoothly
- Results display properly
- Custom renderers work
- Logs are handled via modal, not inline panel

### Task 2.5: Refactor Form Components

**Description:** Update complex form components with field management.

**Components:** ConfigForm, CommandSelector

**Actions:**
- [ ] Refactor `ConfigForm.tsx`
  - [ ] Replace `<box>` with `<Panel>` and `<Container>`
  - [ ] Use `<ScrollView>` for field list
  - [ ] Use `<Field>` components
  - [ ] Remove ScrollBoxRenderable ref type
  - [ ] Use ScrollViewRef instead
  - [ ] Update keyboard handler to use adapter (stack-based, no priority flags)
  - [ ] Test field navigation
  - [ ] Test scrolling to selected field
- [x] Refactor `CommandSelector.tsx`
  - [ ] Replace `<box>` with `<Panel>` and `<Container>`
  - [ ] Use semantic components for command items
  - [ ] Update keyboard handler (stack-based)
  - [ ] Test command navigation
  - [ ] Test subcommand breadcrumbs

**Validation:**
- Field navigation works
- Scrolling keeps selected item visible
- Keyboard shortcuts work with bubbling model
- Form submission works

### Task 2.6: Refactor Main TUI Component

**Description:** Update the main TuiApp component orchestrator.

**Actions:**
- [ ] Refactor `TuiApp.tsx`
  - [ ] Replace all `<box>` with `<Container>`
  - [ ] Update all child component props
  - [ ] Ensure layout still correct
  - [ ] Use navigation + modal stacks (no mode enum); screens consume params/meta
  - [ ] Test command-select/config/running/results/error flows via nav stack
  - [ ] Test modal interactions (logs/editor/CLI) via modal stack
  - [ ] Test focus cycling
  - [ ] Test all keyboard shortcuts (stack-based, modal-first, global fall-through)

**Validation:**
- All application flows work
- Layout matches original
- No regressions in functionality
- Smooth transitions between states
- Copy/back shortcuts honor modal-first behavior

### Task 2.7: Update TuiApplication Renderer Initialization

**Description:** Switch TuiApplication to use renderer factory.

**Actions:**
- [ ] Update `TuiApplication.tsx`
  - [ ] Replace direct OpenTUI renderer creation
  - [ ] Use `createRenderer('opentui', config)` factory
  - [ ] Update config mapping
  - [ ] Ensure alternate screen works
  - [ ] Test TUI launch
  - [ ] Test cleanup on exit

**Validation:**
- Application launches correctly
- Alternate screen works
- Exit cleanup works
- No initialization errors

### Task 2.8: Update Keyboard Context

**Description:** Migrate keyboard context to use the adapter.

**Actions:**
- [ ] Update `KeyboardContext.tsx`
  - [ ] Remove direct OpenTUI imports
  - [ ] Use keyboard adapter
  - [ ] Update KeyEvent type references
  - [ ] Use stack-based handler model (global first, then active/topmost)
  - [ ] Unhandled keys fall through to global shortcuts

**Validation:**
- Keyboard events work correctly
- Bubbling model preserved (handled returns true)
- Modal capture works; unhandled can reach global shortcuts (copy/back)

### Task 2.9: Update Hook Exports

**Description:** Ensure hooks work with semantic components.

**Actions:**
- [ ] Review `useKeyboardHandler.ts` - update types if needed
- [ ] Review `useClipboard.ts` - no changes needed (renderer-agnostic)
- [ ] Review `useSpinner.ts` - no changes needed
- [ ] Review `useCommandExecutor.ts` - no changes needed
- [ ] Review `useLogStream.ts` - no changes needed
- [ ] Review `useConfigState.ts` - no changes needed

**Validation:**
- All hooks work with refactored components
- Type safety maintained

### Task 2.10: Integration Testing - Example App

**Description:** Test the complete application with semantic layer and OpenTUI renderer.

**Actions:**
- [ ] Run example TUI app (`bun run example`)
- [ ] Test command selection
- [ ] Test command configuration
- [ ] Test command execution
- [ ] Test log viewing
- [ ] Test result display
- [ ] Test all keyboard shortcuts
- [ ] Test all modals
- [ ] Test field editing (text, number, boolean, enum)
- [ ] Test clipboard operations
- [ ] Test cancellation
- [ ] Compare visually with pre-refactor version

**Validation:**
- Everything works identically to before refactor
- No visual differences
- No performance regressions
- No crashes or errors

### Task 2.11: Update TypeScript Config

**Description:** Update tsconfig.json if needed for semantic components.

**Actions:**
- [ ] Review current jsxImportSource setting
- [ ] Determine if changes needed for semantic components
- [ ] Update paths if new directories added
- [ ] Verify type checking works

**Validation:**
- `bun run build` succeeds
- No TypeScript errors
- Types resolve correctly

---

