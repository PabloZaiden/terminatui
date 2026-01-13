# Phase 2: Refactor Existing Components to Use Semantic Layer

**Last Updated:** 2026-01-10  
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

- ✅ All 13 component files refactored
- ✅ TuiApp.tsx using semantic components
- ✅ TuiApplication.tsx using renderer factory
- ✅ Keyboard handlers using keyboard adapter (Phase 0B bubbling, modal-aware)
- ✅ Full application working with semantic layer

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

## Phase 2 Completion Checklist

Before proceeding to Phase 3, verify:

✅ All 11 tasks completed  
✅ All components refactored  
✅ No direct OpenTUI primitives used  
✅ Application works identically to before  
✅ No visual regressions  
✅ No performance regressions  
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
