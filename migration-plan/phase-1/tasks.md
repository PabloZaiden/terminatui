# Phase 1: Create Semantic Component Library (OpenTUI Implementation)

**Last Updated:** 2026-01-10  
**Prerequisites:** Phase 0A and 0B must be complete

---

## Goal

Build the abstraction layer using OpenTUI as the initial renderer implementation.

**Deliverables:**
- New semantic component definitions and types
- OpenTUI adapter implementation for all 12 components
- Keyboard input adapter
- Renderer interface and factory
- Updated theme system
- Tests for semantic components

---

## Task 1.1: Set Up Directory Structure

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
- Directory structure matches the design
- All directories have index.ts files for exports

---

## Task 1.2: Define Semantic Component Types

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

---

## Task 1.3: Define Renderer Interface

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

---

## Task 1.4: Update Theme System

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

---

## Task 1.5: Implement Layout Components (OpenTUI)

**Description:** Create OpenTUI implementations for layout semantic components.

**Components:** Panel, Container, ScrollView, Overlay

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

---

## Task 1.6: Implement Content Components (OpenTUI)

**Description:** Create OpenTUI implementations for content semantic components.

**Components:** Label, Value, Code, CodeHighlight

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

---

## Task 1.7: Implement Interactive Components (OpenTUI)

**Description:** Create OpenTUI implementations for interactive semantic components.

**Components:** Field, TextInput, Select, Button

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

---

## Task 1.8: Create Keyboard Input Adapter

**Description:** Abstract keyboard input handling from renderer-specific APIs.

**Actions:**
- [ ] Create `adapters/keyboard.ts` with normalized types
- [ ] Define `KeyboardEvent` interface (key, ctrl, shift, meta, sequence)
- [ ] Implement OpenTUI keyboard adapter in `adapters/opentui/keyboard.ts`
- [ ] Create `useKeyboardInput(handler)` hook wrapper
- [ ] Port existing focus tree system from Phase 0B (bubbling, modal-first)
- [ ] Ensure modal handlers consume only handled keys; unhandled bubble to global (e.g., copy)
- [ ] Test keyboard event normalization

**Validation:**
- Keyboard events normalized to common format
- Focus tree system works correctly (modal-first, bubbling to root)
- Global shortcuts (e.g., copy) still reachable when modals are open if unhandled by modal

---

## Task 1.9: Implement Renderer Factory

**Description:** Create renderer initialization and factory system.

**Actions:**
- [ ] Implement `createRenderer()` factory in `adapters/index.ts`
- [ ] Create OpenTUI renderer class in `adapters/opentui/OpenTUIRenderer.tsx`
  - [ ] Implement `initialize()` method
  - [ ] Implement `render()` method
  - [ ] Implement `destroy()` method
  - [ ] Handle alternate screen, theme, config
- [ ] Export semantic components from adapter
- [ ] Wire up keyboard provider (uses Phase 0B bubbling + modal-first behavior)

**Validation:**
- Factory can create OpenTUI renderer
- Renderer initializes correctly
- Cleanup on destroy works
- Keyboard provider integration preserves bubbling/global shortcuts with modals

---

## Task 1.10: Export Semantic Components

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

---

## Task 1.11: Write Component Tests

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

## Phase 1 Completion Checklist

Before proceeding to Phase 2, verify:

✅ All 11 tasks completed
✅ All validation checkpoints passed
✅ Semantic component library created
✅ OpenTUI adapter fully implemented
✅ Keyboard adapter working
✅ Renderer factory functional
✅ Tests passing
✅ No TypeScript errors
✅ Build succeeds

---

## Next Steps

After Phase 1 completion:
1. Review Phase 1 deliverables
2. Proceed to [Phase 2 Tasks](./phase-2-tasks.md)

---

**Related:**
- [Tasks Overview](./README.md)
- [Phase 2 Tasks](./phase-2-tasks.md)
- [Evaluation](../evaluation/README.md)
