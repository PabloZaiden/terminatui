# Migration Evaluation Overview

**Date:** 2026-01-10  
**Status:** Proposal  
**Target:** Add Ink as a second renderer alongside OpenTUI

---

## Quick Start

This directory contains the evaluation and analysis for adding Ink alongside OpenTUI.

### Read in Order:

1. **[overview.md](./overview.md)** (this file) - Start here
2. **[problem-and-requirements.md](./problem-and-requirements.md)** - Why migrate?
3. **[current-state.md](./current-state.md)** - What needs to change?
4. **[proposed-architecture.md](./proposed-architecture.md)** - How will it work?
5. **[migration-strategy.md](./migration-strategy.md)** - Implementation phases
6. **[decision-context.md](./decision-context.md)** - Why these decisions?

---

## Prerequisites

⚠️ **Phase 0 must be completed first!**

Before implementing the semantic component abstraction and Ink migration described in these documents, **Phase 0 must be completed**. Phase 0 addresses two critical architectural issues:

- **Phase 0A:** Stack-Based Navigation
- **Phase 0B:** Component-Chain Keyboard Handling

See **[../phase-0/README.md](../phase-0/README.md)** for Phase 0 details.

---

## Executive Summary

This evaluation analyzes migrating the TerminaTUI framework from OpenTUI to Ink as the terminal rendering engine. The migration involves ~3,100 lines of TUI code across 31 files, introducing a semantic component abstraction layer to enable renderer swapping while maintaining the framework's CLI/TUI API surface.

### Key Findings:
- **Migration Complexity:** Medium - Well-isolated TUI layer with clear boundaries
- **Breaking Changes:** Minimal - Core framework APIs remain stable
- **Risk Level:** Low-Medium - Clear migration path with incremental validation

### The Problem

OpenTUI is unstable with:
- Poor terminal compatibility (copy/paste issues)
- Occasional crashes
- Binary dependencies complicating distribution
- New and unproven in production

### The Solution

Add Ink (mature, battle-tested) behind a semantic component abstraction layer, while keeping OpenTUI supported.

**Benefits:**
- ✅ Stability and reliability
- ✅ Better terminal compatibility
- ✅ Renderer choice per app
- ✅ Future renderer independence
- ✅ Escape hatch for roadblocks

### The Approach

0. **Phase 0:** Fix navigation and keyboard architecture
1. Build semantic components (Panel, Field, ScrollView, etc.)
2. Implement OpenTUI adapter for semantic components
3. Refactor existing code to use semantic layer
4. Implement Ink adapter
5. Validate dual-renderer support (keep OpenTUI)

---

## Document Structure

### [problem-and-requirements.md](./problem-and-requirements.md)
- Problem statement
- Requirements and constraints
- Assumptions
- Why migrate from OpenTUI

### [current-state.md](./current-state.md)
- OpenTUI coupling analysis
- Primitives used
- Component inventory
- What needs to change

### [proposed-architecture.md](./proposed-architecture.md)
- 3-layer architecture
- Semantic component library (12 components)
- Renderer adapter design
- Component APIs

### [migration-strategy.md](./migration-strategy.md)
- Phase breakdown (Phase 1-4)
- Task overview
- Validation approach
- Timeline estimates

### [decision-context.md](./decision-context.md)
- Q&A from evaluation
- Key design decisions
- Rejected alternatives
- Success metrics

### [risk-and-validation.md](./risk-and-validation.md)
- Risk analysis
- Breaking changes
- Ink capability validation
- Mitigation strategies

---

## Next Steps

1. ✅ **Complete Phase 0** (see [../phase-0/](../phase-0/))
2. Review evaluation documents
3. Review task breakdown (see [../tasks/](../tasks/))
4. Begin Phase 1 implementation

---

**Related Documents:**
- [Main Migration Plan](../README.md)
- [Phase 0: Architecture Improvements](../phase-0/README.md)
- [Migration Tasks](../tasks/README.md)
