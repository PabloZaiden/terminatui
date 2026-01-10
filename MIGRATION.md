# OpenTUI to Ink Migration

This directory contains the complete migration plan and task breakdown for migrating TerminaTUI from OpenTUI to Ink as the terminal rendering engine.

## ⚠️ Important: Ink v6 Required

**Critical:** Ink v6 (not v5) is required for React 19 compatibility. The project uses React 19.2.3, and Ink v5 does NOT work with React 19.

## 📚 Documentation

### [Migration Evaluation](./migration-evaluation.md) (~50 KB)
**Complete analysis and decision documentation**

Contains:
- Problem statement and requirements
- Current state analysis (coupling points, primitives used)
- Proposed 3-layer architecture (semantic components + adapters)
- Risk analysis and mitigation strategies
- Alternative approaches considered
- Decision context and rationale
- Ink capability validation
- Post-migration benefits
- **Re-evaluation corrections** (Ink v6, titled borders, etc.)

**Read this first** to understand why we're migrating and how the solution was designed.

### [Migration Tasks](./migration-tasks.md) (~35 KB)
**Detailed task breakdown for implementation**

Contains:
- Complete task breakdown for all 4 phases
- 60+ actionable tasks with checkboxes
- **Task 3.0: Proof-of-concept validation** (validates Ink v6 + React 19 before full implementation)
- Validation criteria for each task
- Phase dependencies and deliverables
- Task tracking tables
- Success criteria checklist

**Use this** during implementation to track progress.

## 🎯 Quick Summary

**Problem:** OpenTUI is unstable, has poor terminal compatibility, binary dependencies, and blocks development.

**Solution:** Migrate to Ink (mature, battle-tested) with semantic component abstraction layer.

**Approach:** 
1. Build semantic components (Panel, Field, ScrollView, etc.)
2. Implement OpenTUI adapter for semantic components
3. Refactor existing code to use semantic layer
4. Implement Ink adapter
5. Switch to Ink, remove OpenTUI

**Key Benefits:**
- ✅ Stability and reliability
- ✅ Better terminal compatibility
- ✅ No binary dependencies
- ✅ Future renderer independence
- ✅ Smaller package size

## 📋 Migration Phases

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1** | Create semantic component library (OpenTUI impl) | Not Started |
| **Phase 2** | Refactor existing components to use semantic layer | Not Started |
| **Phase 3** | Implement Ink adapter | Not Started |
| **Phase 4** | Switch to Ink, remove OpenTUI | Not Started |

## 🏗️ Proposed Architecture

```
┌─────────────────────────────────────────┐
│  Application Layer (User Code)          │
│  - Command definitions                  │
│  - No changes required                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Framework Layer (TerminaTUI API)       │
│  - TuiApplication                       │
│  - Hooks and utilities                  │
│  - Minimal changes                      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Semantic Component Library (NEW)       │
│  - 12 semantic components               │
│  - Panel, Field, ScrollView, etc.       │
│  - Renderer-agnostic                    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Renderer Adapter (Swappable)           │
│  - OpenTUI Adapter → Ink Adapter        │
└─────────────────────────────────────────┘
```

## 🔧 12 Semantic Components

**Layout:** Panel, Container, ScrollView, Overlay  
**Content:** Label, Value, Code, CodeHighlight  
**Interactive:** Field, TextInput, Select, Button

Each component abstracts rendering details so adapters can implement them differently.

## 📊 Migration Status

**Current State:**
- [x] Problem analysis complete
- [x] Requirements documented
- [x] Architecture designed
- [x] Tasks broken down
- [ ] Implementation not started

**Next Steps:**
1. Review and approve evaluation
2. Build proof-of-concept (2-3 components in both renderers)
3. Begin Phase 1 implementation

## 🔍 Key Files to Understand

| File | Purpose | Read When |
|------|---------|-----------|
| `migration-evaluation.md` | Complete analysis and design | Before starting |
| `migration-tasks.md` | Task breakdown and tracking | During implementation |
| `src/tui/TuiApplication.tsx` | Current renderer integration | Understanding coupling |
| `src/tui/components/*` | Components to refactor | Phase 2 planning |

## 📝 Decision History

### Why semantic components instead of direct migration?
- Avoids repeating the coupling problem
- Enables future renderer changes
- Abstracts implementation details (e.g., scrolling libraries)

### Why 12 components specifically?
- Matches exact current usage patterns
- Avoids over-engineering
- Can extend later if needed

### Why Ink over other options?
- Mature (v5.x) and battle-tested
- Large ecosystem and community
- Pure JavaScript (no binaries)
- Excellent terminal compatibility

See [Decision Context](./migration-evaluation.md#decision-context) for full Q&A.

## ⚠️ Important Notes

1. **Breaking Changes:** Minimal, but users with custom `renderResult()` may need updates
2. **Testing:** Limited existing tests, manual testing emphasized
3. **Timeline:** Full rewrite approach, not gradual migration
4. **User Base:** Only 2 apps using framework, both willing to update

## 🎓 Lessons for Future

This migration was necessary because:
- We tightly coupled to a new, unproven library
- Binary dependencies created distribution issues
- No abstraction layer for renderer independence

The solution ensures:
- ✅ Renderer can be swapped without full rewrite
- ✅ Framework APIs remain stable
- ✅ Implementation details abstracted

## 📞 Questions?

Refer to:
- [Open Questions](./migration-evaluation.md#open-questions) in evaluation doc
- [Decision Context](./migration-evaluation.md#decision-context) for rationale
- [Assumptions](./migration-evaluation.md#assumptions) for what we're assuming

---

**Last Updated:** 2026-01-10  
**Documents Version:** 1.0  
**Status:** Ready for Review and Implementation
