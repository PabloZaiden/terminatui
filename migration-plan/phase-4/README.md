# Phase 4: Dual-Renderer Cutover (Keep OpenTUI + Ink)

**Last Updated:** 2026-01-10  
**Prerequisites:** Phase 3 must be complete

---

## Overview

Finalize Ink as an additional renderer, validate parity, and keep both OpenTUI and Ink supported.

**Goal:** Support both renderers long-term, with a safe per-app selection mechanism.

**Why This Phase:**
- Completes Ink implementation work
- Preserves OpenTUI as a stable fallback
- Enables per-app renderer choice
- Avoids hard cutovers

---

## Deliverables

- ✅ TuiApplication supports both renderers
- ✅ Renderer selection documented (default + overrides)
- ✅ Documentation updated
- ✅ Both example apps validated (shortcuts/copy/modal behavior verified)
- ✅ Performance benchmarks completed
- ✅ Stability improvements confirmed

---

## Documents

### [tasks.md](./tasks.md) - 12 Implementation Tasks
Complete task breakdown with checklists:
- Task 4.1: Finalize Renderer Selection API
- Task 4.2: Validate Dual-Renderer Parity
- Task 4.3: Documentation + Examples
- Task 4.4: CI / Matrix Testing
- Task 4.5: Update Documentation - README
- Task 4.6: Update Documentation - API Docs
- Task 4.7: Test Example App Thoroughly
- Task 4.8: Test Production App
- Task 4.9: Performance Benchmarking
- Task 4.10: Stability Testing
- Task 4.11: Update Migration Evaluation Document
- Task 4.12: Final Validation Checklist

---

## Phase 4 Completion Checklist

Before declaring migration complete, verify:

✅ All 12 tasks completed  
✅ Both OpenTUI and Ink supported  
✅ Renderer selection works (default + override)  
✅ Documentation updated  
✅ Example app works perfectly  
✅ Production app works perfectly  
✅ Performance targets met  
✅ Stability improved  
✅ Tests passing  
✅ Build succeeds  
✅ Migration complete! 🎉

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
- ✅ Copy/paste reliable on both renderers
- ✅ Example app parity on both renderers
- ✅ Renderer selection documented
- ✅ Tests pass

---

## Next Steps

After Phase 4 completion:
1. Release new version
2. Update production apps
3. Archive migration documentation
4. Celebrate! 🎉

---

**Related:**
- [Phase 3](../phase-3/README.md)
- [Main Migration Plan](../README.md)
- [Evaluation](../evaluation/README.md)
