# OpenTUI to Ink Migration - Task Breakdown

**Document Version:** 1.0  
**Last Updated:** 2026-01-10  
**Related:** [Migration Evaluation](./migration-evaluation.md)

---

## Overview

This document provides a detailed task breakdown for migrating TerminaTUI from OpenTUI to Ink. The migration is organized into 4 sequential phases, with each phase delivering a stable, testable milestone.

**Migration Phases:**
1. **Phase 1:** Create Semantic Component Library (OpenTUI Implementation)
2. **Phase 2:** Refactor Existing Components to Use Semantic Layer
3. **Phase 3:** Implement Ink Adapter
4. **Phase 4:** Migration Cutover and OpenTUI Removal

---

## Phase 1: Create Semantic Component Library (OpenTUI Implementation)

**Goal:** Build the abstraction layer using OpenTUI as the initial renderer implementation.

**Deliverables:**
- New semantic component definitions and types
- OpenTUI adapter implementation for all 12 components
- Keyboard input adapter
- Renderer interface and factory
- Updated theme system
- Tests for semantic components

### Task 1.1: Set Up Directory Structure

**Description:** Create new directory structure for semantic components and adapters.

**Actions:**
- [ ] Create `src/tui/semantic/` directory
- [ ] Create `src/tui/semantic/components/` directory
- [ ] Create `src/tui/semantic/types.ts` file
- [ ] Create `src/tui/semantic/index.ts` file
- [ ] Create `src/tui/adapters/` directory
- [ ] Create `src/tui/adapters/types.ts` file
- [ ] Create `src/tui/adapters/opentui/` directory
- [ ] Create `src/tui/adapters/opentui/components/` directory
- [ ] Create `src/tui/adapters/ink/` directory (placeholder)

**Validation:**
- Directory structure matches the design in migration-evaluation.md
- All directories have index.ts files for exports

### Task 1.2: Define Semantic Component Types

**Description:** Create TypeScript interfaces for all 12 semantic components.

**Actions:**
- [ ] Define `PanelProps` interface in `types.ts`
- [ ] Define `ContainerProps` interface
- [ ] Define `ScrollViewProps` and `ScrollViewRef` interface
- [ ] Define `OverlayProps` interface
- [ ] Define `LabelProps` interface
- [ ] Define `ValueProps` interface
- [ ] Define `CodeProps` interface
- [ ] Define `CodeHighlightProps` interface
- [ ] Define `FieldProps` interface
- [ ] Define `TextInputProps` interface
- [ ] Define `SelectProps` and `SelectOption` interface
- [ ] Define `ButtonProps` interface
- [ ] Define `ThemeConfig` type for semantic colors
- [ ] Document each interface with JSDoc comments

**Validation:**
- All prop types are well-defined with TypeScript
- Props are renderer-agnostic (no OpenTUI/Ink specifics)
- JSDoc comments explain purpose and usage

### Task 1.3: Define Renderer Interface

**Description:** Create the abstraction interface that renderers must implement.

**Actions:**
- [ ] Create `RendererConfig` interface in `adapters/types.ts`
- [ ] Create `Renderer` interface with lifecycle methods
- [ ] Define `createRenderer(type, config)` factory function signature
- [ ] Create `RendererType` enum or union type ('opentui' | 'ink')
- [ ] Document renderer initialization flow
- [ ] Add keyboard adapter interface

**Validation:**
- Interface is generic enough for both OpenTUI and Ink
- Clear separation between renderer concerns and app concerns

### Task 1.4: Update Theme System

**Description:** Refactor theme to support semantic color mapping.

**Actions:**
- [ ] Update `src/tui/theme.ts` structure
- [ ] Define base color palette (hex values)
- [ ] Create semantic color mapping (label, value, error, etc.)
- [ ] Add theme type definitions
- [ ] Document color usage guidelines
- [ ] Ensure theme works with both OpenTUI and future Ink

**Validation:**
- Theme colors can be referenced semantically
- No hardcoded colors in component code
- Theme is extensible for custom colors

### Task 1.5: Implement Layout Components (OpenTUI)

**Description:** Create OpenTUI implementations for layout semantic components.

**Components:**
- Panel (bordered container with title, focus)
- Container (flexbox layout wrapper)
- ScrollView (scrollable content area)
- Overlay (absolute positioned modal)

**Actions:**
- [ ] Implement `Panel.tsx` in `adapters/opentui/components/`
  - [ ] Map border styles
  - [ ] Handle focus state styling
  - [ ] Support title rendering
  - [ ] Map flexbox props
- [ ] Implement `Container.tsx`
  - [ ] Map flexDirection, flex, align, justify props
  - [ ] Handle gap, padding props
  - [ ] Support nested containers
- [ ] Implement `ScrollView.tsx`
  - [ ] Wrap OpenTUI `<scrollbox>`
  - [ ] Support vertical/horizontal scrolling
  - [ ] Implement ref for programmatic scrolling
  - [ ] Handle stickyToEnd for logs
  - [ ] Support keyboard scrolling when focused
- [ ] Implement `Overlay.tsx`
  - [ ] Use absolute positioning
  - [ ] Support zIndex
  - [ ] Handle backdrop/dimming

**Validation:**
- Each component renders correctly with OpenTUI
- Props map correctly to OpenTUI primitives
- Visual appearance matches current implementation

### Task 1.6: Implement Content Components (OpenTUI)

**Description:** Create OpenTUI implementations for content semantic components.

**Components:**
- Label (styled text for headers/labels)
- Value (display values)
- Code (monospace code/command)
- CodeHighlight (syntax-highlighted code)

**Actions:**
- [ ] Implement `Label.tsx` in `adapters/opentui/components/`
  - [ ] Map semantic colors to theme
  - [ ] Support text styles (bold, italic)
  - [ ] Handle wrapping
- [ ] Implement `Value.tsx`
  - [ ] Use value color from theme
  - [ ] Support long value truncation
  - [ ] Handle multiline values
- [ ] Implement `Code.tsx`
  - [ ] Use monospace rendering
  - [ ] Support scrolling for long code
  - [ ] Handle code color
- [ ] Implement `CodeHighlight.tsx`
  - [ ] Port existing JsonHighlight logic
  - [ ] Support syntax tokens
  - [ ] Map token colors to theme

**Validation:**
- Text renders with correct colors
- Monospace code displays properly
- Syntax highlighting works

### Task 1.7: Implement Interactive Components (OpenTUI)

**Description:** Create OpenTUI implementations for interactive semantic components.

**Components:**
- Field (form field row with label + value + selection)
- TextInput (single-line text input)
- Select (option picker/dropdown)
- Button (action button)

**Actions:**
- [ ] Implement `Field.tsx` in `adapters/opentui/components/`
  - [ ] Render label and value with prefix (►)
  - [ ] Handle selection state
  - [ ] Support onActivate callback
- [ ] Implement `TextInput.tsx`
  - [ ] Wrap OpenTUI `<input>`
  - [ ] Handle placeholder
  - [ ] Support onChange and onSubmit
  - [ ] Manage focus state
- [ ] Implement `Select.tsx`
  - [ ] Wrap OpenTUI `<select>`
  - [ ] Map SelectOption to OpenTUI format
  - [ ] Handle selection change and submit
  - [ ] Support focus and keyboard navigation
- [ ] Implement `Button.tsx`
  - [ ] Render with selection styling
  - [ ] Support hover/selected states
  - [ ] Handle activation

**Validation:**
- All interactive components respond to keyboard
- Focus states visible and correct
- Callbacks fire appropriately

### Task 1.8: Create Keyboard Input Adapter

**Description:** Abstract keyboard input handling from renderer-specific APIs.

**Actions:**
- [ ] Create `adapters/keyboard.ts` with normalized types
- [ ] Define `KeyboardEvent` interface (key, ctrl, shift, meta, sequence)
- [ ] Implement OpenTUI keyboard adapter in `adapters/opentui/keyboard.ts`
- [ ] Create `useKeyboardInput(handler)` hook wrapper
- [ ] Port existing priority system (Global, Focused, Modal)
- [ ] Test keyboard event normalization

**Validation:**
- Keyboard events normalized to common format
- Priority system works correctly
- Modal capture prevents event bubbling

### Task 1.9: Implement Renderer Factory

**Description:** Create renderer initialization and factory system.

**Actions:**
- [ ] Implement `createRenderer()` factory in `adapters/index.ts`
- [ ] Create OpenTUI renderer class in `adapters/opentui/OpenTUIRenderer.tsx`
  - [ ] Implement `initialize()` method
  - [ ] Implement `render()` method
  - [ ] Implement `destroy()` method
  - [ ] Handle alternate screen, theme, config
- [ ] Export semantic components from adapter
- [ ] Wire up keyboard provider

**Validation:**
- Factory can create OpenTUI renderer
- Renderer initializes correctly
- Cleanup on destroy works

### Task 1.10: Export Semantic Components

**Description:** Create public exports for semantic components.

**Actions:**
- [ ] Update `src/tui/semantic/index.ts` with all component exports
- [ ] Export component types
- [ ] Export theme utilities
- [ ] Add JSDoc documentation
- [ ] Create example usage snippets

**Validation:**
- All components importable from `@pablozaiden/terminatui/tui`
- TypeScript types work correctly
- No renderer-specific exports leak

### Task 1.11: Write Component Tests

**Description:** Add tests for semantic component API.

**Actions:**
- [ ] Set up test framework for TUI components
- [ ] Write tests for Panel component
- [ ] Write tests for Container component
- [ ] Write tests for ScrollView component
- [ ] Write tests for Field component
- [ ] Write tests for TextInput component
- [ ] Write tests for Select component
- [ ] Test keyboard adapter
- [ ] Test theme system

**Validation:**
- All components have basic test coverage
- Type safety validated
- Props work as expected

---

## Phase 2: Refactor Existing Components to Use Semantic Layer

**Goal:** Update all existing TUI components to use the new semantic component library instead of OpenTUI primitives directly.

**Deliverables:**
- All 13 component files refactored
- TuiApp.tsx using semantic components
- TuiApplication.tsx using renderer factory
- Keyboard handlers using keyboard adapter
- Full application working with semantic layer

### Task 2.1: Refactor Simple Components

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
- [ ] Refactor `Header.tsx`
  - [ ] Replace `<box>` with `<Container>`
  - [ ] Replace `<text>` with `<Label>`
  - [ ] Use semantic layout props
  - [ ] Test breadcrumb rendering
- [ ] Refactor `StatusBar.tsx`
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

**Components:** EditorModal, CliModal

**Actions:**
- [ ] Refactor `EditorModal.tsx`
  - [ ] Replace `<box>` with `<Overlay>`
  - [ ] Use `<TextInput>` and `<Select>` semantic components
  - [ ] Use `<Panel>` for modal container
  - [ ] Update keyboard handler to use adapter
  - [ ] Test enum/boolean/text editing
- [ ] Refactor `CliModal.tsx`
  - [ ] Replace `<box>` with `<Overlay>`
  - [ ] Use `<ScrollView>` for horizontal scrolling
  - [ ] Use `<Code>` for command display
  - [ ] Update keyboard handler
  - [ ] Test command display and copy

**Validation:**
- Modals overlay correctly
- Input components work
- Keyboard shortcuts functional
- Modal can be dismissed

### Task 2.4: Refactor Panel Components

**Description:** Update components that use scrolling and complex layouts.

**Components:** LogsPanel, ResultsPanel

**Actions:**
- [ ] Refactor `LogsPanel.tsx`
  - [ ] Replace `<box>` with `<Panel>`
  - [ ] Use `<ScrollView>` with stickyToEnd
  - [ ] Use `<Label>` for log lines
  - [ ] Preserve log color coding
  - [ ] Test auto-scroll to bottom
  - [ ] Test large log volumes
- [ ] Refactor `ResultsPanel.tsx`
  - [ ] Replace `<box>` with `<Panel>`
  - [ ] Use `<ScrollView>` for results
  - [ ] Use semantic content components
  - [ ] Support custom renderResult
  - [ ] Test with various result types
  - [ ] Test error display

**Validation:**
- Scrolling works smoothly
- Log colors correct
- Results display properly
- Custom renderers work

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
  - [ ] Update keyboard handler to use adapter
  - [ ] Test field navigation
  - [ ] Test scrolling to selected field
- [ ] Refactor `CommandSelector.tsx`
  - [ ] Replace `<box>` with `<Panel>` and `<Container>`
  - [ ] Use semantic components for command items
  - [ ] Update keyboard handler
  - [ ] Test command navigation
  - [ ] Test subcommand breadcrumbs

**Validation:**
- Field navigation works
- Scrolling keeps selected item visible
- Keyboard shortcuts work
- Form submission works

### Task 2.6: Refactor Main TUI Component

**Description:** Update the main TuiApp component orchestrator.

**Actions:**
- [ ] Refactor `TuiApp.tsx`
  - [ ] Replace all `<box>` with `<Container>`
  - [ ] Update all child component props
  - [ ] Ensure layout still correct
  - [ ] Test all modes (CommandSelect, Config, Running, Results, Error)
  - [ ] Test modal interactions
  - [ ] Test focus cycling
  - [ ] Test all keyboard shortcuts

**Validation:**
- All application modes work
- Layout matches original
- No regressions in functionality
- Smooth transitions between states

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
  - [ ] Test priority system still works
  - [ ] Test modal capture

**Validation:**
- Keyboard events work correctly
- Priority ordering maintained
- Stop propagation works

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
- [ ] Set up KeyboardProvider with Ink adapter
- [ ] Test component mounting/unmounting
- [ ] Verify component hierarchy works

**Validation:**
- All components accessible via Ink renderer
- Keyboard provider works
- Components render in hierarchy

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
  - [ ] Log panel display and scrolling
  - [ ] Result panel display
  - [ ] All modals (CLI, Editor)
  - [ ] All keyboard shortcuts
  - [ ] Focus cycling
  - [ ] Clipboard operations
  - [ ] Command cancellation
- [ ] Document any differences from OpenTUI version
- [ ] Fix critical issues
- [ ] Note performance differences

**Validation:**
- All features work functionally
- Visual appearance acceptable
- Performance adequate
- No critical bugs

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

## Phase 4: Migration Cutover and OpenTUI Removal

**Goal:** Switch default renderer to Ink, remove OpenTUI dependencies, and complete the migration.

**Deliverables:**
- TuiApplication defaulting to Ink
- OpenTUI dependencies removed
- Documentation updated
- Both example apps validated
- Performance benchmarks

### Task 4.1: Switch Default Renderer to Ink

**Description:** Make Ink the default renderer in TuiApplication.

**Actions:**
- [ ] Update `TuiApplication.tsx`
- [ ] Change default renderer from 'opentui' to 'ink'
- [ ] Update renderer initialization
- [ ] Remove OpenTUI-specific configuration
- [ ] Test application launch

**Validation:**
- App launches with Ink by default
- No initialization errors
- Smooth startup

### Task 4.2: Update Package Dependencies

**Description:** Remove OpenTUI and update package.json.

**Actions:**
- [ ] Remove `@opentui/react` from dependencies
- [ ] Remove `@opentui/core` if separate
- [ ] Verify all Ink dependencies present
- [ ] Run `bun install` to update lockfile
- [ ] Check for unused dependencies
- [ ] Update peer dependencies if needed

**Validation:**
- Package.json has only Ink dependencies
- No OpenTUI references remain
- Dependencies install cleanly

### Task 4.3: Update TypeScript Configuration

**Description:** Update tsconfig for Ink/React JSX.

**Actions:**
- [ ] Update `tsconfig.json`
- [ ] Change `jsxImportSource` from `@opentui/react` to `react`
- [ ] Verify jsx configuration
- [ ] Run `bun run build` to validate
- [ ] Fix any type errors

**Validation:**
- TypeScript builds without errors
- JSX transforms correctly
- Type checking works

### Task 4.4: Remove OpenTUI Adapter Code

**Description:** Clean up OpenTUI adapter implementation.

**Actions:**
- [ ] Remove `src/tui/adapters/opentui/` directory
- [ ] Remove OpenTUI renderer from factory
- [ ] Remove OpenTUI type references
- [ ] Update imports if needed
- [ ] Clean up any OpenTUI-specific utilities

**Validation:**
- No OpenTUI code remains in codebase
- No import errors
- Builds successfully

### Task 4.5: Update Documentation - README

**Description:** Update README to reflect Ink migration.

**Actions:**
- [ ] Update dependencies section in README.md
- [ ] Update any OpenTUI references
- [ ] Add note about migration from OpenTUI
- [ ] Update examples if needed
- [ ] Review for accuracy

**Validation:**
- README accurate
- No OpenTUI mentions remain
- Examples work

### Task 4.6: Update Documentation - API Docs

**Description:** Update API documentation for semantic components.

**Actions:**
- [ ] Document semantic component library
- [ ] Add examples for custom renderResult with semantic components
- [ ] Document migration guide for users
- [ ] Provide before/after code examples
- [ ] Document any breaking changes

**Validation:**
- Clear migration path for users
- Examples compile and work
- Breaking changes documented

### Task 4.7: Test Example App Thoroughly

**Description:** Comprehensive testing of included example app.

**Actions:**
- [ ] Run `bun run example`
- [ ] Test every command in the app
- [ ] Test all TUI interactions
- [ ] Test configuration persistence
- [ ] Test settings command
- [ ] Test help command
- [ ] Test all error cases
- [ ] Verify logs work correctly
- [ ] Test cancellation scenarios
- [ ] Verify clipboard functionality

**Validation:**
- Example app works flawlessly
- No regressions from OpenTUI version
- Performance acceptable
- UX feels smooth

### Task 4.8: Test Production App

**Description:** Validate the external production application using the framework.

**Actions:**
- [ ] Update production app to latest framework version
- [ ] Run production app TUI mode
- [ ] Test all production commands
- [ ] Test any custom renderResult implementations
- [ ] Verify production workflows
- [ ] Test with production data/scenarios
- [ ] Get user feedback
- [ ] Fix any issues found

**Validation:**
- Production app works correctly
- Custom components render properly
- No blocking issues
- Users satisfied with stability

### Task 4.9: Performance Benchmarking

**Description:** Measure and validate performance improvements.

**Actions:**
- [ ] Measure app startup time
  - [ ] Before (OpenTUI):
  - [ ] After (Ink):
- [ ] Measure input latency
  - [ ] Before:
  - [ ] After:
- [ ] Measure memory usage
  - [ ] Before:
  - [ ] After:
- [ ] Test scrolling performance with large datasets
- [ ] Test rapid keyboard input
- [ ] Compare package size
  - [ ] Before:
  - [ ] After:
- [ ] Document results

**Validation:**
- Performance meets or exceeds targets
- No significant regressions
- Package size reduced significantly

### Task 4.10: Stability Testing

**Description:** Validate reliability improvements over OpenTUI.

**Actions:**
- [ ] Run app for extended period (stress test)
- [ ] Test rapid mode switching
- [ ] Test edge cases (large logs, complex JSON)
- [ ] Test terminal resizing
- [ ] Test in various terminal emulators
- [ ] Test copy/paste reliability
- [ ] Test SSH/remote scenarios
- [ ] Document any crashes or issues

**Validation:**
- No crashes during normal use
- Handles edge cases gracefully
- Copy/paste works reliably
- Stable in all tested terminals

### Task 4.11: Update Migration Evaluation Document

**Description:** Document actual results vs. estimates.

**Actions:**
- [ ] Add Phase 4 completion to migration-evaluation.md
- [ ] Document actual vs. estimated effort
- [ ] Note any assumption violations
- [ ] Document unexpected issues and solutions
- [ ] Add "lessons learned" section
- [ ] Update success metrics with actuals

**Validation:**
- Document reflects reality
- Useful for future reference
- Captures important learnings

### Task 4.12: Final Validation Checklist

**Description:** Complete final validation before declaring migration complete.

**Checklist:**
- [ ] All tests pass (`bun run test`)
- [ ] Build succeeds (`bun run build`)
- [ ] Example app works perfectly
- [ ] Production app works perfectly
- [ ] Documentation updated
- [ ] No OpenTUI dependencies remain
- [ ] Performance targets met
- [ ] Stability improved
- [ ] Copy/paste works reliably
- [ ] Cross-platform validated
- [ ] Terminal compatibility improved
- [ ] Distribution simplified (no binaries)
- [ ] Migration guide published
- [ ] Team trained on changes

**Final Sign-off:**
- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] All blockers resolved
- [ ] Ready for release

---

## Task Tracking

### Phase Status

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| Phase 1: Semantic Layer | Not Started | - | - | |
| Phase 2: Refactor Components | Not Started | - | - | Depends on Phase 1 |
| Phase 3: Ink Adapter | Not Started | - | - | Depends on Phase 2 |
| Phase 4: Cutover | Not Started | - | - | Depends on Phase 3 |

### Blockers and Issues

| ID | Phase | Issue | Severity | Status | Resolution |
|----|-------|-------|----------|--------|------------|
| - | - | - | - | - | - |

### Decisions Made During Implementation

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| - | - | - | - |

---

## Success Criteria

The migration is complete and successful when:

- ✅ All functionality works with Ink renderer
- ✅ Example app runs without issues  
- ✅ Production app runs without issues
- ✅ No visual regressions
- ✅ Performance meets or exceeds targets
- ✅ Stability improved (no crashes)
- ✅ Terminal compatibility improved
- ✅ Copy/paste reliable
- ✅ Package size reduced
- ✅ Distribution simplified
- ✅ Documentation updated
- ✅ Tests pass
- ✅ OpenTUI fully removed

---

## Notes and Observations

### Phase 1 Notes

*To be filled during implementation*

### Phase 2 Notes

*To be filled during implementation*

### Phase 3 Notes

*To be filled during implementation*

### Phase 4 Notes

*To be filled during implementation*

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-10  
**Status:** Ready for Implementation
