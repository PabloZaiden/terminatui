# Phase 0: Architecture Improvements

**Document Version:** 1.0  
**Last Updated:** 2026-01-10  
**Status:** In Progress (navigation stack, modal-first back handling, global copy/logs implemented; storyboard drafted for validation)

---

## Overview

Phase 0 contains critical architectural improvements that must be implemented **before** the OpenTUI to Ink migration. These improvements address fundamental design issues in the current codebase that would be harder to fix after introducing the semantic component abstraction layer.

**Two Core Issues:**
1. **State Management & Navigation** - Complex mode switching with scattered state
2. **Keyboard Event Handling** - Flat priority system without component hierarchy

**Why Phase 0 First:**
- These are architectural concerns independent of rendering library
- Easier to validate without the complexity of renderer abstraction
- Simplifies the subsequent migration work
- Improves maintainability regardless of rendering engine

---

## Phase Structure

### Phase 0A: Stack-Based Navigation
**Document:** [phase-0a-navigation.md](./phase-0a-navigation.md)

Replace mode-based state management with navigation stack.

**Key Changes:**
- Remove 13+ state variables
- Implement navigation stack
- Create screen-specific components
- Encapsulate screen state

**Tasks:** 5 implementation tasks with validation checkpoints

### Phase 0B: Component-Chain Keyboard Handling
**Document:** [phase-0b-keyboard.md](./phase-0b-keyboard.md)

Replace flat priority-based keyboard handling with component hierarchy bubbling.

**Key Changes:**
- Remove priority-based system
- Implement focus tree
- Event bubbling through component chain
- Natural modal capture (modal-first, but unhandled keys can bubble for globals like copy)

**Tasks:** 6 implementation tasks with validation checkpoints

---

## Implementation Order

**SEQUENTIAL EXECUTION REQUIRED:**

1. **Complete Phase 0A first**
   - All tasks validated
   - Navigation working correctly
   - Screen components created

2. **Then complete Phase 0B**
   - Depends on screen components from 0A
   - Benefits from simplified state management
   - Keyboard handlers reference screen types

**DO NOT start Phase 0B until Phase 0A is complete and validated.**

---

## Related Documents

- **[Problem Analysis](./problem-analysis.md)** - Current implementation issues
- **[Implementation Order](./implementation-order.md)** - Sequencing and success criteria
- **[Phase 0A: Navigation](./phase-0a-navigation.md)** - Stack-based navigation tasks
- **[Phase 0B: Keyboard](./phase-0b-keyboard.md)** - Component-chain keyboard tasks

---

## Next Steps

1. Read [problem-analysis.md](./problem-analysis.md) to understand current issues
2. Review [phase-0a-navigation.md](./phase-0a-navigation.md) for first implementation
3. Complete Phase 0A tasks with validation
4. Review [phase-0b-keyboard.md](./phase-0b-keyboard.md) for second implementation
5. Complete Phase 0B tasks with validation
6. Proceed to Phase 1 (semantic components migration)

---

**Last Updated:** 2026-01-10  
**Status:** Ready for Implementation
