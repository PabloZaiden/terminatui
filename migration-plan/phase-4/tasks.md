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
