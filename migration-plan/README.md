# OpenTUI to Ink Migration

This directory contains the complete migration plan and task breakdown for migrating TerminaTUI from OpenTUI to Ink as the terminal rendering engine.

## ⚠️ Important: Ink v6 Required

**Critical:** Ink v6 (not v5) is required for React 19 compatibility. The project uses React 19.2.3, and Ink v5 does NOT work with React 19.

## 📚 Documentation

### [Phase 0: Architecture Improvements](./phase-0/README.md)
**Core architecture refactoring (MUST DO FIRST)**

Contains:
- [Problem Analysis](./phase-0/problem-analysis.md) - Current issues
- [Phase 0A: Stack-Based Navigation](./phase-0/phase-0a-navigation.md) - 5 tasks
- [Phase 0B: Component-Chain Keyboard](./phase-0/phase-0b-keyboard.md) - 6 tasks
- [Implementation Order](./phase-0/implementation-order.md) - Sequencing & success criteria

**Start here** - Complete Phase 0A and 0B before proceeding to rendering migration.

### [Migration Evaluation](./evaluation/README.md)
**Analysis and decision documentation**

Contains:
- Problem statement and requirements
- Current state analysis
- Proposed 3-layer architecture
- Migration strategy overview
- Decision context and rationale

**Read this second** to understand why we're migrating and the solution design.

### Phase-Specific Documentation
**Detailed task breakdowns organized by phase**

- [Phase 1: Semantic Component Library](./phase-1/README.md) - 11 tasks
- [Phase 2: Refactor to Semantic Layer](./phase-2/README.md) - 11 tasks
- [Phase 3: Ink Adapter Implementation](./phase-3/README.md) - 13 tasks
- [Phase 4: Migration Cutover](./phase-4/README.md) - 12 tasks

**Use during implementation** to track progress through each phase.

## 🎯 Quick Summary

**Problem:** OpenTUI is unstable, has poor terminal compatibility, binary dependencies, and blocks development.

**Solution:** Migrate to Ink (mature, battle-tested) with semantic component abstraction layer.

**Approach:** 
0. **Phase 0 (Architecture):** Fix navigation and keyboard handling
   - 0A: Stack-based navigation ✅
   - 0B: Component-chain keyboard bubbling ⏸️ (deferred - current stack-based model sufficient)
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
| **Phase 0A** | Stack-based navigation (architecture improvement) | ✅ Complete |
| **Phase 0B** | Component-chain keyboard handling (architecture improvement) | ⏸️ Deferred (not needed) |
| **Phase 1** | Create semantic component library (OpenTUI impl) | ✅ Complete |
| **Phase 2** | Refactor existing components to use semantic layer | ✅ Complete |
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
- [x] Phase 0A complete: Stack-based navigation + registry-based screens/modals
- [x] Phase 1 complete: Semantic component layer + OpenTUI adapter + renderer interface/factory
- [x] Phase 2 complete: App UI fully uses semantic components (no raw OpenTUI primitives/imports outside adapter)

**Next Steps:**
1. Do a quick manual UI parity pass (modals, status bar, command selector, config forms)
2. Start Phase 3 Ink adapter implementation ([tasks](./phase-3/tasks.md))

**Current Focus:** [Phase 2 - Refactor to Semantic Layer](./phase-2/README.md)

## 🔍 Key Documents to Read (In Order)

| Document | Purpose | Read When |
|----------|---------|-----------|
| [phase-0/README.md](./phase-0/README.md) | Phase 0 overview | **Before starting** |
| [phase-0/problem-analysis.md](./phase-0/problem-analysis.md) | Current architecture problems | Understanding issues |
| [phase-0/phase-0a-navigation.md](./phase-0/phase-0a-navigation.md) | Stack navigation tasks | Implementing Phase 0A |
| [phase-0/phase-0b-keyboard.md](./phase-0/phase-0b-keyboard.md) | Keyboard handling tasks | Implementing Phase 0B |
| [evaluation/README.md](./evaluation/README.md) | Migration evaluation overview | Before Phase 1 |
| [phase-1/README.md](./phase-1/README.md) | Semantic components overview | Implementing Phase 1 |
| [phase-1/tasks.md](./phase-1/tasks.md) | Semantic components tasks | During Phase 1 |
| [phase-2/README.md](./phase-2/README.md) | Refactoring overview | Implementing Phase 2 |
| [phase-3/README.md](./phase-3/README.md) | Ink adapter overview | Implementing Phase 3 |
| [phase-4/README.md](./phase-4/README.md) | Cutover overview | Implementing Phase 4 |

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

**Last Updated:** 2026-01-14  
**Documents Version:** 1.2  
**Status:** Phase 2 Complete - Ready for Phase 3
