# Implementation Order & Success Criteria

**Last Updated:** 2026-01-10

---

## Implementation Order

The two phases must be completed **sequentially**, with a storyboard checkpoint between them:

### Phase 0A First: Stack-Based Navigation (completed)
**Document:** [phase-0a-navigation.md](./phase-0a-navigation.md)

**Rationale:**
- Simplifies state management before tackling keyboard
- Reduces complexity in keyboard handlers (no mode checks needed)
- Screen components provide natural boundaries for keyboard handlers
- Easier to validate navigation independently

### Storyboard Checkpoint (after Phase 0A, before Phase 0B)
**Document:** [storyboard.md](./storyboard.md)
- Capture screen/modal flows, global behaviors, copy/back rules, and data providers so TuiApp can become screen-agnostic.
- Must be validated before Phase 0B.

### Navigation Refactor (post-storyboard, pre-0B)
- Refactor TuiApp to be screen-driven: screens/modals declare transitions and data providers (e.g., clipboard content); TuiApp handles only global concerns (back, logs toggle, global copy) and orchestrates navigation without per-screen branching.
- Outcome: removes hardcoded per-route logic from TuiApp; enables Phase 0B focus-tree work.

### Phase 0B Second: Component-Chain Keyboard (next up)
**Document:** [phase-0b-keyboard.md](./phase-0b-keyboard.md)

**Rationale:**
- Depends on screen components from Phase 0A, validated storyboard, and navigation refactor
- Screen hierarchy makes focus tree clearer
- Can reference screen types instead of mode enum
- Benefits from simplified state management

**⚠️ Next:** Validate storyboard, refactor navigation per storyboard, then implement focus-tree bubbling per Phase 0B plan.

---

## Success Criteria

### Phase 0A Success

✅ **State Management**
- No `mode` enum in codebase
- All 13 state variables removed from TuiApp
- Single `Screen[]` stack manages navigation

✅ **Navigation**
- Forward/back navigation works correctly
- Screen state preserved in stack
- Modals managed via modal stack (modal-first close), screens via screen stack

✅ **Screen Components**
- Each screen encapsulates its own logic
- No mode-specific conditionals scattered in code
- Easy to add new screen types

✅ **Functionality**
- All existing features work
- No regressions in user experience
- Command execution flow correct

---

### Phase 0B Success

✅ **Keyboard Handling**
- Event bubbling works from focused component to root
- Handlers return boolean for handled/not-handled
- No priority-based system remains

✅ **Focus Management**
- Focus tree reflects component hierarchy
- `setFocus()` changes which component receives events
- Modals capture input by being root nodes

✅ **Component Handlers**
- Each component handles its own keys
- Unhandled keys bubble to parent
- No duplicate or conflicting handlers

✅ **Functionality**
- All keyboard shortcuts work
- Modal input capture works
- No regressions in user experience

---

### Overall Phase 0 Success

✅ **Code Quality**
- Reduced state complexity
- Better separation of concerns
- More testable components
- Clear architectural boundaries

✅ **Developer Experience**
- Easier to understand navigation flow
- Easier to add new screens
- Easier to debug keyboard issues
- Less coupling between components

✅ **Foundation for Migration**
- Clean architecture to build semantic components on
- Screen components ready for renderer abstraction
- Keyboard system ready for renderer adapter
- Ready to proceed with Phase 1 of migration

---

## Manual Validation Guidelines

After implementing each task, perform manual validation:

### General Testing
1. **Smoke Test**: Launch app, select command, configure, run, view results
2. **Navigation**: Test all forward/back navigation paths
3. **Keyboard Shortcuts**: Test every keyboard shortcut in every screen
4. **Modals**: Open and close all modals
5. **Edge Cases**: Empty lists, long values, rapid navigation

### Phase 0A Specific Testing
1. Navigate through entire command hierarchy (nested subcommands)
2. Go back from each screen type
3. Verify breadcrumbs update correctly
4. Check that field selection persists when navigating back
5. Verify logs panel state preserved
6. Test immediate execution commands (skip config screen)

### Phase 0B Specific Testing
1. Test each keyboard shortcut in each screen
2. Verify modal input capture (background shouldn't respond to handled keys)
3. Test field navigation (up/down/tab)
4. Verify focus indicators visible and correct
5. Test unhandled keys bubble correctly (e.g., 'c' from field → screen handler)
6. Test copy shortcut with and without modal open (modal content first, else screen)

### When Validation Fails
1. **Document the issue**: What's broken? When does it happen?
2. **Identify root cause**: State synchronization? Event bubbling? Focus management?
3. **Fix implementation**: Update code to address root cause
4. **Re-test**: Repeat validation until issue resolved
5. **Document workaround**: If architectural change needed, document why

**DO NOT proceed to next task until current task validation passes.**

---

## Timeline Expectations

### Phase 0A Estimate
- Task 0A.1: 2-3 hours (Navigation Context)
- Task 0A.2: 4-6 hours (Screen Components)
- Task 0A.3: 3-4 hours (Refactor TuiApp)
- Task 0A.4: 1-2 hours (Command Execution)
- Task 0A.5: 1-2 hours (Helper Functions)
- **Total: ~11-17 hours**

### Phase 0B Estimate
- Task 0B.1: 3-4 hours (KeyboardContext)
- Task 0B.2: 2-3 hours (useKeyboardHandler Hook)
- Task 0B.3: 1-2 hours (TuiApp Handlers)
- Task 0B.4: 2-3 hours (Screen Handlers)
- Task 0B.5: 2-3 hours (Form/Modal Handlers)
- Task 0B.6: 1-2 hours (Remove Old System)
- **Total: ~11-17 hours**

### Validation Time
- Add 20-30% for validation and iteration
- **Total Phase 0: ~27-43 hours of implementation work**

---

## Rollback Strategy

If critical issues are found during validation:

### Phase 0A Rollback
1. Git revert all Phase 0A commits
2. Return to mode-based state management
3. Document issues encountered
4. Re-evaluate navigation stack approach

### Phase 0B Rollback
1. Git revert all Phase 0B commits
2. Return to priority-based keyboard system
3. Keep Phase 0A navigation changes (they're independent)
4. Document issues encountered
5. Re-evaluate keyboard bubbling approach

**Note:** Phase 0A and 0B are independent enough that one can be rolled back without affecting the other.

---

## Next Steps After Phase 0

Once Phase 0A and 0B are complete and validated:

1. **Update migration docs** - Reflect completed Phase 0 work
2. **Begin Phase 1** - Semantic component library creation
3. **Reference Phase 0** - Use screen types and keyboard patterns in Phase 1

See:
- [Main Migration Plan](../README.md)
- [Phase 1 Tasks](../tasks/phase-1-tasks.md)

---

**Related:**
- [Phase 0 Overview](./README.md)
- [Problem Analysis](./problem-analysis.md)
- [Phase 0A Tasks](./phase-0a-navigation.md)
- [Phase 0B Tasks](./phase-0b-keyboard.md)
