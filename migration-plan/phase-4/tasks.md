## Phase 4: Dual-Renderer Cutover (Keep OpenTUI + Ink)

**Goal:** Ship Ink as an additional renderer while keeping OpenTUI supported.

**Deliverables:**
- TuiApplication supports both renderers
- Documented renderer selection (default + override)
- Documentation updated
- Example apps validated on both renderers
- Basic performance notes (optional)

### Task 4.1: Finalize Renderer Selection API

**Description:** Provide a stable way to select renderer per app invocation.

**Actions:**
- [ ] Decide default renderer (likely `opentui` for now)
- [ ] Ensure `TuiApplication` accepts a renderer option (`"opentui" | "ink"`)
- [ ] Ensure CLI entry points can pass renderer selection through
- [ ] Document how to choose renderer (env var / flag / config)

**Validation:**
- App launches with either renderer
- Selection mechanism is stable and documented

### Task 4.2: Validate Dual-Renderer Parity

**Description:** Confirm the semantic layer provides acceptable parity on both renderers.

**Actions:**
- [ ] Ensure all 12 semantic components are implemented in Ink adapter
- [ ] Verify keyboard behavior parity (global shortcuts + active handler)
- [ ] Verify overlays/modals parity (stacking, closing, focus)
- [ ] Verify scrolling parity (results, logs)

**Validation:**
- No major UX regressions between renderers
- Both renderers can run the same app flows

### Task 4.3: Documentation + Examples

**Description:** Update docs/examples to reflect dual-renderer support.

**Actions:**
- [ ] Update README/docs to explain renderer selection
- [ ] Ensure examples can run with `opentui` and `ink`
- [ ] Add a short “when to choose which renderer” note

**Validation:**
- Docs are accurate
- Example apps run on both renderers

### Task 4.4: CI / Matrix Testing

**Description:** Make it hard to regress one renderer while working on the other.

**Actions:**
- [ ] Run automated checks against both renderers where possible
- [ ] Add smoke test script(s) that launch both renderers in example app

**Validation:**
- Regressions are caught early
- Both renderers stay buildable

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
- [ ] Verify logs work correctly (logs modal, modal-first close)
- [ ] Test cancellation scenarios
- [ ] Verify clipboard functionality (modal content first, else screen)

**Validation:**
- Example app works flawlessly
- No regressions from OpenTUI version
- Performance acceptable
- UX feels smooth
- Shortcuts/copy honor modal-first rules

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
- [ ] Test rapid navigation + modal stacking
- [ ] Test edge cases (large logs, complex JSON)
- [ ] Test terminal resizing
- [ ] Test in various terminal emulators
- [ ] Test copy/paste reliability (modal-first, bubbling for globals)
- [ ] Test SSH/remote scenarios
- [ ] Document any crashes or issues

**Validation:**
- No crashes during normal use
- Handles edge cases gracefully
- Copy/paste works reliably (modal-first rules)
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
