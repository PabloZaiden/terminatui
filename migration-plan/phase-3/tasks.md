## Phase 3: Implement Ink Adapter

**Goal:** Create a complete Ink renderer implementation that can replace OpenTUI.

**Deliverables:**
- Ink renderer class and initialization
- All 12 semantic components implemented for Ink
- Ink keyboard adapter
- Integration testing with Ink
- Performance validation

**Critical Note:** Ink v6 is required for React 19 compatibility. Ink v5 does NOT work with React 19.

### Task 3.0: Validate Ink v6 + React 19 Compatibility (Proof of Concept)

**Description:** Before implementing the full adapter, validate that Ink v6 + React 19 + all required libraries work together.

**Actions:**
- [ ] Create minimal test project with React 19 + Ink v6
- [ ] Test basic `<Box>` and `<Text>` rendering
- [ ] Test borders with `<Box borderStyle="round">`
- [ ] Test titled borders with `@rwirnsberger/ink-titled-box`
- [ ] Test `ink-scroll-view` scrolling
- [ ] Test `ink-text-input` text input
- [ ] Test `ink-select-input` select component
- [ ] Test `useInput` keyboard handling
- [ ] Document any compatibility issues or workarounds needed

**Validation:**
- All libraries install without peer dependency conflicts
- Basic rendering works correctly
- All input components function properly
- If issues found, document and adjust plan before proceeding

**STOP POINT:** If critical issues are found, evaluate alternatives before continuing.

### Task 3.1: Add Ink Dependencies

**Description:** Install Ink and related libraries.

**Actions:**
- [ ] Add `ink` (^6.2.0) to package.json - **v6 required for React 19 compatibility**
- [ ] Add `@rwirnsberger/ink-titled-box` for titled borders (Ink v6's Box doesn't support titles)
- [ ] Add `ink-text-input` (^6.0.0) for text input
- [ ] Add `ink-select-input` (^6.2.0) for select
- [ ] Add `ink-scroll-view` (^1.0.0) for scrolling
- [ ] Verify `chalk` is included with Ink (usually is)
- [ ] Run `bun install`
- [ ] Verify installations

**Note:** `ink-box` is deprecated. Ink v6 has borders built-in to `<Box>` component.

**Validation:**
- All dependencies install successfully
- No version conflicts with React 19.x
- TypeScript types available

### Task 3.2: Create Ink Renderer Class

**Description:** Implement the Renderer interface for Ink.

**Actions:**
- [ ] Create `adapters/ink/InkRenderer.tsx`
- [ ] Implement `initialize()` method
  - [ ] Set up Ink app instance
  - [ ] Configure alternate screen
  - [ ] Configure theme/colors
- [ ] Implement `render(element)` method
  - [ ] Use Ink's render function
  - [ ] Return instance handle
- [ ] Implement `destroy()` method
  - [ ] Clean up Ink instance
  - [ ] Restore terminal state
- [ ] Handle configuration options

**Validation:**
- Renderer initializes without errors
- Can render simple React element
- Cleanup works properly

### Task 3.3: Implement Ink Keyboard Adapter

**Description:** Create keyboard input adapter for Ink.

**Actions:**
- [ ] Create `adapters/ink/keyboard.ts`
- [ ] Implement adapter using Ink's `useInput` hook
- [ ] Map Ink's `(input, key)` to normalized KeyboardEvent
- [ ] Handle special keys (escape, return, arrows, etc.)
- [ ] Handle ctrl/shift/meta modifiers
- [ ] Test key event normalization

**Validation:**
- All keyboard events normalized correctly
- Special keys map properly
- Modifiers detected accurately

### Task 3.4: Implement Ink Layout Components

**Description:** Create Ink implementations for layout semantic components.

**Components:** Panel, Container, ScrollView, Overlay

**Actions:**
- [ ] Implement `Panel.tsx` in `adapters/ink/components/`
  - [ ] Use Ink v6's built-in `<Box>` with `borderStyle` prop for simple borders
  - [ ] Use `@rwirnsberger/ink-titled-box` for panels with titles
  - [ ] Map border styles (round, single, double, etc.)
  - [ ] Handle title rendering
  - [ ] Map focus colors
  - [ ] Support flexbox layout
- [ ] Implement `Container.tsx`
  - [ ] Use Ink's `<Box>` component
  - [ ] Map flexDirection, flexGrow, etc.
  - [ ] Handle padding, margin, gap
  - [ ] Support alignment and justification
- [ ] Implement `ScrollView.tsx`
  - [ ] Use `ink-scroll-view` library
  - [ ] Support vertical/horizontal scrolling
  - [ ] Implement ref forwarding for programmatic scroll
  - [ ] Handle stickyToEnd prop
  - [ ] Integrate with useFocus for keyboard scrolling
- [ ] Implement `Overlay.tsx`
  - [ ] Use Ink's absolute positioning
  - [ ] Handle zIndex via stacking
  - [ ] Implement backdrop if needed

**Validation:**
- Panels render with correct borders
- Layout flexbox works as expected
- Scrolling is smooth
- Overlays position correctly

### Task 3.5: Implement Ink Content Components

**Description:** Create Ink implementations for content semantic components.

**Components:** Label, Value, Code, CodeHighlight

**Actions:**
- [ ] Implement `Label.tsx` in `adapters/ink/components/`
  - [ ] Use Ink's `<Text>` component
  - [ ] Map semantic colors to chalk colors
  - [ ] Support bold, italic, underline
- [ ] Implement `Value.tsx`
  - [ ] Use `<Text>` with value color
  - [ ] Handle long value display
- [ ] Implement `Code.tsx`
  - [ ] Use `<Text>` with monospace styling
  - [ ] Handle code color
- [ ] Implement `CodeHighlight.tsx`
  - [ ] Port syntax highlighting logic
  - [ ] Use chalk for token colors
  - [ ] Render tokens inline

**Validation:**
- Text renders with correct colors
- Chalk color mapping works
- Syntax highlighting displays properly

### Task 3.6: Implement Ink Interactive Components

**Description:** Create Ink implementations for interactive semantic components.

**Components:** Field, TextInput, Select, Button

**Actions:**
- [ ] Implement `Field.tsx` in `adapters/ink/components/`
  - [ ] Use `<Box>` for layout
  - [ ] Render label and value with selection indicator
  - [ ] Handle selection styling
- [ ] Implement `TextInput.tsx`
  - [ ] Use `ink-text-input` library
  - [ ] Map props (value, placeholder, onChange, onSubmit)
  - [ ] Handle focus state
  - [ ] Style to match theme
- [ ] Implement `Select.tsx`
  - [ ] Use `ink-select-input` library
  - [ ] Map SelectOption format
  - [ ] Handle selection and submission
  - [ ] Style selected item
- [ ] Implement `Button.tsx`
  - [ ] Render with selection styling
  - [ ] Use Text/Box for button display
  - [ ] Handle hover/selected states

**Validation:**
- Fields respond to keyboard input
- TextInput accepts and submits text
- Select navigates and selects options
- Button shows selection state

### Task 3.7: Map Theme to Chalk Colors

**Description:** Create color mapping from theme hex values to Chalk colors.

**Actions:**
- [ ] Create `adapters/ink/theme.ts`
- [ ] Implement hex-to-chalk color mapper
- [ ] Support 256-color mode for better matching
- [ ] Test color appearance in different terminals
- [ ] Document color mapping

**Validation:**
- Colors appear similar to OpenTUI version
- Acceptable in multiple terminals
- Fallbacks work for limited color terminals

### Task 3.8: Wire Up Ink Components to Renderer

**Description:** Integrate all Ink components with the renderer.

**Actions:**
- [ ] Export all components from `adapters/ink/components/index.ts`
- [ ] Update InkRenderer to provide components
- [ ] Set up KeyboardProvider with Ink adapter (focus-tree/bubbling, modal-first, unhandled keys bubble)
- [ ] Test component mounting/unmounting
- [ ] Verify component hierarchy works

**Validation:**
- All components accessible via Ink renderer
- Keyboard provider works with bubbling/modal stack semantics
- Components render in hierarchy
- Global shortcuts (e.g., copy) still reachable when modals are open if unhandled by modal

### Task 3.9: Update Renderer Factory

**Description:** Add Ink renderer to the factory.

**Actions:**
- [ ] Update `createRenderer()` in `adapters/index.ts`
- [ ] Add 'ink' case to renderer type
- [ ] Return InkRenderer instance for 'ink' type
- [ ] Document renderer selection
- [ ] Add type safety for renderer selection

**Validation:**
- Factory can create Ink renderer
- Type checking works
- Config passes through correctly

### Task 3.10: Basic Integration Testing

**Description:** Test Ink renderer with a simple test app.

**Actions:**
- [ ] Create minimal test app using Ink renderer
- [ ] Test basic rendering (Panel, Label, Container)
- [ ] Test keyboard input
- [ ] Test scrolling
- [ ] Test inputs (TextInput, Select)
- [ ] Fix any issues found

**Validation:**
- Basic components render
- Keyboard input works
- No crashes or errors

### Task 3.11: Full Integration Testing - Example App

**Description:** Run the full example app with Ink renderer.

**Actions:**
- [ ] Temporarily modify TuiApplication to use Ink renderer
- [ ] Run example TUI app
- [ ] Test all functionality:
  - [ ] Command selection and navigation
  - [ ] Command configuration forms
  - [ ] Field editing (all types)
  - [ ] Command execution
  - [ ] Logs modal display and scrolling (no panel)
  - [ ] Result panel display
  - [ ] All modals (CLI, Editor, Logs)
  - [ ] All keyboard shortcuts (bubbling, modal-first)
  - [ ] Focus cycling
  - [ ] Clipboard operations (modal content first, else screen)
  - [ ] Command cancellation
- [ ] Document any differences from OpenTUI version
- [ ] Fix critical issues
- [ ] Note performance differences

**Validation:**
- All features work functionally
- Visual appearance acceptable
- Performance adequate
- No critical bugs
- Shortcuts/copy behave with modal-first rules

### Task 3.12: Cross-Platform Testing

**Description:** Test Ink renderer on different platforms and terminals.

**Actions:**
- [ ] Test on macOS (iTerm2, Terminal.app)
- [ ] Test on Linux (GNOME Terminal, xterm)
- [ ] Test on Windows WSL (Windows Terminal)
- [ ] Test over SSH connections
- [ ] Test in Docker containers
- [ ] Document any platform-specific issues
- [ ] Apply workarounds if needed

**Validation:**
- Works on all major platforms
- No critical platform-specific bugs
- Acceptable fallback behavior for limited terminals

---

