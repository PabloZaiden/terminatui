# Phase 2: Refactor Existing Components to Use Semantic Layer

**Last Updated:** 2026-01-14  
**Prerequisites:** Phase 1 must be complete

---

## Overview

Update all existing TUI components to use the new semantic component library instead of OpenTUI primitives directly.

**Goal:** Refactor all components to use semantic layer while maintaining functionality with OpenTUI renderer.

**Why This Phase:**
- Validates semantic component API design
- Ensures semantic layer can express all current functionality
- Maintains working state before switching renderers
- Allows validation without Ink complexity

---

## Deliverables

- ✅ Semantic component layer in use throughout core UI
- ✅ TuiApp.tsx uses semantic layer for Header/StatusBar/CommandSelector, etc.
- ✅ Modals render without dimming the whole screen
- ✅ Status bar text no longer corrupts (removed control characters)
- ✅ Global background is painted explicitly at root (via semantic root wrapper)
- ✅ OpenTUI adapter uses direction-specific padding props
- ✅ StatusBar stabilized (fixed height) to avoid "falling" during editor modal open
- ✅ Full application working with semantic layer (OpenTUI renderer)

---

## Documents

### [tasks.md](./tasks.md) - 11 Implementation Tasks
Complete task breakdown with checklists:
- Task 2.1: Refactor Simple Components
- Task 2.2: Refactor JsonHighlight Component
- Task 2.3: Refactor Modal Components
- Task 2.4: Refactor Panel Components
- Task 2.5: Refactor Form Components
- Task 2.6: Refactor Main TUI Component
- Task 2.7: Update TuiApplication Renderer Initialization
- Task 2.8: Update Keyboard Context
- Task 2.9: Update Hook Exports
- Task 2.10: Integration Testing - Example App
- Task 2.11: Update TypeScript Config

---

## Phase 2 Remaining Work

Phase 2 is complete.

Optional sanity checks before moving to Phase 3:
- Do a final parity sweep across screens:
  - command selection
  - config form (including editor modal)
  - results view
  - logs modal / CLI modal
- Confirm `bun run build` and `bun run test` pass.

## Phase 2 Completion Checklist

Before proceeding to Phase 3, verify:

✅ Application runs via semantic layer  
✅ OpenTUI usage is isolated to the adapter  
✅ Visual parity acceptable (no major layout glitches)  
✅ Modals behave correctly (no fullscreen dim regression)  
✅ Status bar stable and readable  
✅ Tests passing  
✅ Build succeeds  

---

## Next Steps

After Phase 2 completion:
1. Review Phase 2 deliverables
2. Proceed to [Phase 3](../phase-3/README.md)

---

**Related:**
- [Phase 1](../phase-1/README.md)
- [Phase 3](../phase-3/README.md)
- [Main Migration Plan](../README.md)
