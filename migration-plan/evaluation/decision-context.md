# Decision Context and Rationale

**Part of:** [Migration Evaluation](./README.md)

---

## Decision Context

This section documents the key decisions and rationale discussed during the evaluation phase.

### Q&A: Migration Approach

**Q: What specific stability issues have you encountered with OpenTUI?**  
**A:** Three main categories:
1. Bad copy/paste and mouse handling in generic terminals
2. Occasional crashes during normal operation
3. Binary dependencies across platforms making distribution harder

**Q: What timeline are you targeting?**  
**A:** Full rewrite. Only 2 apps using the framework (example + 1 production). Apps shouldn't have coupling to OpenTUI, so as long as APIs are mostly preserved, we're good. Breaking changes are acceptable if needed.

**Q: Which Ink scrolling solution?**  
**A:** Use `ink-scroll-view` library - proven and maintained.

**Q: What level of abstraction?**  
**A:** Favor a **semantic component library** over thin adapters because:
- Users don't interact with components directly 99% of time (except custom results)
- Abstraction should include layout, colors, behaviors - everything component-related
- Each renderer adapter implements the semantic components independently
- Example: OpenTUI has scrolling built-in, Ink uses dependency - semantic layer hides this
- Makes it easier to decouple: build semantic layer first (with OpenTUI), then swap renderer

**Q: Backward compatibility concerns?**  
**A:** Breaking changes are OK. Don't worry about backwards compatibility too much. Just try not to require massive rewrites of apps using the framework.

**Q: Existing tests?**  
**A:** Very few or no tests for TUI components. Testing strategy needs to be established.

**Q: Features to preserve?**  
**A:** Nothing OpenTUI-specific comes to mind. Everything should be doable with Ink. Potential issues:
- Scrolling: Solved with `ink-scroll-view`
- Keyboard handling: Both have ways to intercept keys, just different APIs

**Q: Stay with React?**  
**A:** Yes, maintain React as the component model.

### Key Design Decisions

1. **Semantic Component Library Over Direct Migration**
   - Rationale: Avoid repeating the coupling mistake
   - Prevents future lock-in to any renderer
   - Enables evaluation of alternatives later
   - Abstracts renderer paradigms (e.g., scrolling implementations)

2. **12 Components is Sufficient**
   - Rationale: Matches actual current usage
   - Avoids over-engineering
   - Can extend later if needed
   - Keeps maintenance burden reasonable

3. **Coarse-Grained Components**
   - Rationale: Simpler API, matches use cases
   - Examples: `<Panel>` not `<Border>` + `<Box>`
   - Reduces abstraction overhead
   - Easier to learn and use

4. **Full Rewrite Over Gradual Migration**
   - Rationale: Small user base makes it feasible
   - Cleaner end result
   - Faster overall completion
   - Can make breaking changes if justified

5. **Keep Both Renderers Long-Term**
   - Rationale: Preserve OpenTUI as a mature option while adding Ink as an escape hatch
   - Some apps may hit renderer-specific roadblocks; allow choosing per app
   - Avoid high-risk cutover events
   - Maintain parity via CI/smoke testing and shared semantic layer

### Rejected Alternatives

1. **Direct Ink Migration (No Abstraction):** Repeats coupling problem
2. **Thin Adapter Only:** Doesn't meet "not too fitted" requirement  
3. **Full UI Framework:** Over-engineering, 3x effort for 12 components
4. **Wait for OpenTUI:** Stability issues blocking real usage

### Solution Constraints That Drove Design

1. **User Code Impact Minimization**
   - Constraint: "Don't require massive rewrite of apps"
   - Impact: Keep Command class APIs stable, only affect custom renderResult()
   - Result: Framework layer changes isolated from application layer

2. **Abstraction Level**
   - Constraint: "Don't want abstraction too fitted to current renderer"
   - Impact: Semantic components must be paradigm-agnostic
   - Result: Components express intent (Panel, Field) not implementation (Box, FlexBox)

3. **Component Scope**
   - Constraint: "Users don't interact with components 99% of time"
   - Impact: No need for general-purpose TUI library
   - Result: 12 components matching exact current usage patterns

4. **Scrolling**
   - Constraint: "OpenTUI has OOTB, Ink needs dependency - shouldn't matter"
   - Impact: ScrollView must abstract implementation details
   - Result: Semantic ScrollView component, adapters handle specifics

5. **Migration Path**
   - Constraint: "Make it easier to decouple first, then swap renderer"
   - Impact: Can't do direct migration to Ink
   - Result: Build semantic layer with OpenTUI first, validate, then add Ink adapter

6. **Testing Reality**
   - Constraint: "Few or no existing TUI tests"
   - Impact: Can't rely on automated test coverage for validation
   - Result: Manual testing emphasis, integration over unit tests

### Success Metrics Derived from Problem Statement

The migration addresses the original problems if:

| Problem | Success Metric | How Validated |
|---------|----------------|---------------|
| Poor terminal compatibility | Copy/paste works reliably across terminals | Manual testing in 5+ terminals |
| Crashes | Zero crashes in normal operation | Stress testing + 2 week production use |
| Binary dependencies | Pure JS, package size < 5MB | Check package.json, measure bundle |
| Distribution complexity | Single `bun install`, works cross-platform | Test on macOS/Linux/Windows |
| Maturity concerns | Using battle-tested library (Ink v5.x) | Verify Ink adoption metrics |
| Development blocked | Apps can be built and deployed reliably | Both apps run successfully in production |

---
## Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Ink missing critical feature | Low | High | Deep evaluation of Ink capabilities before starting |
| Performance issues with Ink | Low | Medium | Benchmark early, optimize if needed |
| Keyboard handling differences | Medium | Medium | Comprehensive keyboard adapter testing |
| Scrolling UX degradation | Medium | Medium | Use proven `ink-scroll-view` library |
| Breaking changes for users | Low | Medium | Maintain API surface, provide migration guide |
| Component parity issues | Low | High | Feature matrix validation before implementation |

### Migration Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Abstraction too complex | Medium | Medium | Keep semantic layer minimal, practical |
| Abstraction too simplistic | Low | High | Design with both renderers in mind |
| Phase 1-2 takes too long | Medium | Low | Incremental validation, early feedback |
| Bugs in production apps | Low | High | Thorough testing, gradual rollout |

### Recommended Risk Controls

1. **Early prototype:** Build 2-3 semantic components with both renderers in Phase 1
2. **Incremental validation:** Test after each component refactor in Phase 2
3. **Feature parity checklist:** Validate all features work before removing OpenTUI
4. **Rollback plan:** Keep OpenTUI adapter for 1-2 releases as fallback option
5. **User testing:** Have both app teams test before final cutover

---

## Breaking Changes Analysis

### Framework API Changes

Most framework APIs **remain unchanged**:

✅ **No Changes Required:**
- `Command` class and all methods
- `TuiApplication` constructor API
- `execute()`, `buildConfig()`, `renderResult()` signatures
- All hooks: `useClipboard`, `useSpinner`, `useCommandExecutor`, `useLogStream`
- `AppContext` and services
- CLI mode (completely unaffected)

⚠️ **Minor Changes:**
- `useKeyboardHandler`: Keyboard event type may change slightly (internal detail)
- Custom `renderResult()`: May need to use semantic components instead of OpenTUI primitives

### User Code Migration

**For 99% of users:** No changes needed. Apps using standard features work as-is.

**For custom result renderers:** May need updates:

```typescript
// Before (OpenTUI primitives)
override renderResult(result: CommandResult): ReactNode {
    return (
        <box flexDirection="column">
            <text fg="#61afef">{result.data.title}</text>
        </box>
    );
}

// After (Semantic components)
override renderResult(result: CommandResult): ReactNode {
    return (
        <Container direction="column">
            <Label color="primary">{result.data.title}</Label>
        </Container>
    );
}
```

**Migration Guide Needed:** Provide before/after examples for common patterns.

---

## Ink Capability Validation

### Required Features ✅

| Feature | OpenTUI | Ink | Status | Notes |
|---------|---------|-----|--------|-------|
| React support | ✅ Built-in | ✅ Built-in | ✅ Compatible | Both use React reconciler |
| Flexbox layout | ✅ Native | ✅ Yoga | ✅ Compatible | Nearly identical APIs |
| Text styling | ✅ Colors | ✅ Chalk | ✅ Compatible | Rich color support |
| Borders | ✅ Native | ✅ Built-in (v6) | ✅ Compatible | Ink v6 has borders on Box |
| Titled Borders | ✅ Native | ⚠️ Library | ✅ Compatible | Use `@rwirnsberger/ink-titled-box` |
| Scrolling | ✅ Built-in | ⚠️ Library | ✅ Compatible | Use `ink-scroll-view` |
| Keyboard input | ✅ useKeyboard | ✅ useInput | ✅ Compatible | Different API, adaptable |
| Text input | ✅ Built-in | ✅ ink-text-input | ✅ Compatible | Mature library |
| Select/List | ✅ Built-in | ✅ ink-select-input | ✅ Compatible | Mature library |
| Focus management | ✅ Built-in | ✅ useFocus | ✅ Compatible | Different approach |
| Alternate screen | ✅ Config | ✅ Native | ✅ Compatible | Built-in support |
| Color themes | ✅ Hex colors | ✅ Chalk | ✅ Compatible | Map hex to chalk |

### Optional Features

| Feature | OpenTUI | Ink | Impact if Missing |
|---------|---------|-----|-------------------|
| Mouse support | ✅ Built-in | ⚠️ Manual | Low - not heavily used |
| 3D rendering | ✅ WebGPU | ❌ None | None - not used |
| Unicode support | ✅ Full | ✅ Full | N/A |
| Emoji support | ✅ Full | ✅ Full | N/A |

### Ink Dependencies

```json
{
  "dependencies": {
    "ink": "^6.2.0",
    "react": "^19.0.0",
    "ink-text-input": "^6.0.0",
    "ink-select-input": "^6.2.0",
    "ink-scroll-view": "^1.0.0",
    "@rwirnsberger/ink-titled-box": "^1.0.0"
  }
}
```

**Notes:**
- **Ink v6 required** for React 19 compatibility (Ink v5 does NOT work with React 19)
- **Borders are built-in** to Ink v6's `<Box>` component (no separate `ink-box` needed)
- **Titled boxes** require third-party `@rwirnsberger/ink-titled-box` (Ink's built-in borders don't support titles)

**Total Package Size:** ~2-3 MB (vs OpenTUI's binary dependencies)

---

## Abstraction Design Considerations

### Key Design Decisions

#### 1. Component Granularity

**Option A: Fine-grained (more components)**
- Pros: More reusable, easier to customize
- Cons: More components to maintain, larger API surface

**Option B: Coarse-grained (fewer components) ← RECOMMENDED**
- Pros: Simpler, matches actual usage patterns
- Cons: Less flexibility for future use cases

**Decision:** Use coarse-grained semantic components that match current use cases exactly (12 components).

#### 2. Styling Approach

**Option A: Inline props (OpenTUI style)**
```typescript
<Panel borderColor="#61afef" padding={1} bg="#1e2127">
```

**Option B: Semantic props ← RECOMMENDED**
```typescript
<Panel color="focused" padding="normal">
```

**Decision:** Use semantic color names that map to theme, avoiding direct color values.

#### 3. Layout Model

**Option A: Expose full flexbox API**
- Pros: Maximum flexibility
- Cons: Tight coupling to flexbox

**Option B: High-level layout props ← RECOMMENDED**
- Pros: Simpler, renderer-agnostic
- Cons: Might be too limiting

**Decision:** Expose common flexbox properties but with semantic names:
- `direction: 'row' | 'column'`
- `flex: boolean` (flexGrow: 1)
- `align: 'start' | 'center' | 'end'`
- `justify: 'start' | 'center' | 'end' | 'between'`

#### 4. Scrolling API

**Option A: Controlled scrolling (external state)**
```typescript
<ScrollView scrollY={scrollPos} onScroll={setScrollPos}>
```

**Option B: Uncontrolled with ref ← RECOMMENDED**
```typescript
const ref = useRef<ScrollViewRef>(null);
ref.current?.scrollTo(index);
<ScrollView ref={ref}>
```

**Decision:** Uncontrolled with ref for programmatic control (matches current usage).

### Anti-patterns to Avoid

❌ **Don't:** Leak renderer-specific types into public APIs
```typescript
// Bad - exposes OpenTUI type
function MyComponent({ ref }: { ref: ScrollBoxRenderable }) { }
```

✅ **Do:** Use semantic types
```typescript
// Good - semantic ref type
function MyComponent({ ref }: { ref: ScrollViewRef }) { }
```

❌ **Don't:** Pass renderer-specific props through
```typescript
// Bad - OpenTUI-specific prop
<Panel {...opentuiSpecificProps} />
```

✅ **Do:** Map to semantic props
```typescript
// Good - semantic props only
<Panel focused padding="normal" />
```

---

## Alternative Approaches Considered

### Alternative 1: Direct Ink Migration (No Abstraction)

**Description:** Replace OpenTUI components directly with Ink equivalents throughout the codebase.

**Pros:**
- Faster initial migration (skip Phase 1)
- Simpler codebase (no abstraction layer)
- Direct access to Ink features

**Cons:**
- **No renderer swapping capability** - locked to Ink
- Hard to rollback if Ink has issues
- Difficult to evaluate alternatives in future
- Tight coupling to renderer (same problem as now)

**Verdict:** ❌ Rejected - Repeats the same mistake that created the current problem

### Alternative 2: Thin Adapter Layer Only

**Description:** Create minimal adapters that wrap OpenTUI/Ink primitives without semantic components.

**Pros:**
- Less abstraction overhead
- Easier to maintain
- More flexibility

**Cons:**
- Doesn't address "abstraction too fitted" concern
- Components still think in renderer terms
- Limited future-proofing

**Verdict:** ❌ Rejected - Doesn't meet goal of decoupling from renderer paradigms

### Alternative 3: Full UI Framework (TUI React Component Library)

**Description:** Build a comprehensive, reusable TUI component library like "TUI-Kit" or "Termui".

**Pros:**
- Could be open-sourced as separate project
- Maximum reusability
- Best practices for TUI development

**Cons:**
- **Massive scope** - 2-3x the effort
- Over-engineering for current needs
- Long development time

**Verdict:** ❌ Rejected - Scope too large, not justified by 12 components

### Alternative 4: Wait for OpenTUI Stability

**Description:** Continue with OpenTUI, contribute fixes, wait for maturity.

**Pros:**
- No migration effort
- Support ecosystem growth
- Features we already use

**Cons:**
- Uncertain timeline for stability
- Binary dependency issues remain
- Limited control over direction
- **Blocks app development** due to current issues

**Verdict:** ❌ Rejected - Stability issues blocking real usage

### Recommended Approach: Semantic Component Library (Hybrid)

**Description:** The proposed 3-layer architecture with 12 semantic components and swappable adapters.

**Pros:**
- ✅ Addresses all stated concerns
- ✅ Reasonable scope and effort
- ✅ Future-proof against renderer changes
- ✅ Maintains framework API stability
- ✅ Provides migration path

**Cons:**
- More upfront work than direct migration
- Additional abstraction layer to maintain
- Potential over-engineering for 12 components

**Verdict:** ✅ **RECOMMENDED** - Best balance of goals vs. effort

---

## Post-Migration Benefits

### Immediate Benefits

1. **Stability:** Ink is mature (v5.x), battle-tested, widely used
2. **Terminal compatibility:** Better copy/paste, fewer crashes
3. **Distribution:** Pure JavaScript, no binary dependencies
4. **Community:** Large ecosystem, active maintenance, many plugins
5. **Performance:** Lighter weight, faster startup

### Long-term Benefits

1. **Renderer independence:** Can evaluate alternatives without full rewrite
2. **Testability:** Semantic components easier to test in isolation
3. **Maintainability:** Clear separation of concerns
4. **Documentation:** Semantic API easier to document for users
5. **Future-proofing:** Not locked into any single renderer

### Quantified Improvements

| Metric | OpenTUI | Ink (Expected) | Improvement |
|--------|---------|----------------|-------------|
| Package size | ~15 MB (binaries) | ~3 MB | **80% smaller** |
| Startup time | ~500ms | ~200ms | **60% faster** |
| Terminal compat | Poor | Excellent | **Major** |
| Stability | 6/10 | 9/10 | **50% better** |
| Ecosystem | Small | Large | **10x plugins** |

---

## Recommendations

### Immediate Actions (Week 1)

1. ✅ **Approve migration** - Decision to proceed with Ink migration
2. 📦 **Validate Ink** - Build small proof-of-concept with 2-3 components
3. 📋 **Create detailed Phase 1 plan** - Break down semantic component tasks
4. 🧪 **Set up testing framework** - Add tests for semantic components

### Phase Execution (Weeks 2-4)

1. **Week 2:** Phase 1 - Build semantic layer with OpenTUI adapter
2. **Week 3:** Phase 2 - Refactor existing components + Ink adapter start
3. **Week 4:** Phase 3 completion - Finish Ink adapter + Phase 4 cutover

### Success Criteria

Migration is successful when:

- ✅ All existing functionality works with Ink renderer
- ✅ Both example apps run without issues
- ✅ No visual regressions
- ✅ Keyboard shortcuts work identically
- ✅ Scrolling is smooth and responsive
- ✅ Copy/paste works reliably
- ✅ No crashes during normal usage
- ✅ Performance is same or better
- ✅ Tests pass for all components
- ✅ Documentation updated

### Rollback Plan

If Ink has critical issues:

1. Keep OpenTUI adapter code for 2 releases
2. Add renderer selection flag: `--renderer=opentui`
3. Document known issues and workarounds
4. Evaluate alternatives: blessed, react-blessed, etc.

---

## Open Questions

1. **Mouse support:** Do we need mouse support, or is keyboard-only sufficient?
   - Current usage suggests keyboard-only is fine

2. **Testing strategy:** Unit tests, integration tests, or visual regression tests?
   - Recommend: Integration tests for full workflows + manual testing

3. **Renderer selection:** Should users be able to choose renderer at runtime?
   - Recommend: No - adds complexity for minimal benefit

4. **OpenTUI adapter:** Keep as fallback or remove completely?
   - Recommend: Remove after 1 stable release with Ink

5. **Component library scope:** Should we build more components than currently needed?
   - Recommend: No - build what we need, extend later if needed

6. **Scrolling library:** `ink-scroll-view` or build custom?
   - Recommend: Use library - proven, maintained

7. **Titled borders:** Ink v6's built-in Box borders don't support titles. Use third-party library?
   - Current usage: Several panels use `title` prop (ConfigForm, LogsPanel, etc.)
   - **Decision:** Use `@rwirnsberger/ink-titled-box` (maintained, supports Ink v6)

8. **ink-scroll-view + Ink v6 + React 19:** Validate this combination works before full implementation
   - **Decision:** Added Task 3.0 in migration-tasks.md for proof-of-concept validation

---

## Re-evaluation Notes (2026-01-10)

This section documents corrections and clarifications discovered during re-evaluation of the migration plan.

### Critical Corrections Made

| Issue | Original | Corrected |
|-------|----------|-----------|
| **Ink version** | ^5.0.1 | **^6.2.0** (v6 required for React 19 compatibility) |
| **ink-box dependency** | Listed as required | **Removed** - deprecated, Ink v6 has borders built-in |
| **Border implementation** | Use `ink-box` component | Use Ink v6's native `<Box borderStyle="...">` |
| **Titled borders** | Not addressed | Added `@rwirnsberger/ink-titled-box` dependency |

### React 19 Compatibility

**Important Finding:** Ink v5 does NOT work with React 19 due to breaking changes in React internals. The project uses React 19.2.3, so **Ink v6 is mandatory**.

Ink v6 (6.2.3+) officially supports React >=19.0.0 and resolves all compatibility issues.

### Titled Borders Consideration

Current code uses `title` prop on bordered boxes:
```tsx
<box border={true} title="Configure: Settings">
```

Ink v6's built-in `<Box>` does **not** support titled borders.

**Decision:** Use `@rwirnsberger/ink-titled-box` (maintained, supports Ink v6)

### Validation Tasks Added

Added **Task 3.0** in migration-tasks.md: Proof-of-concept validation before full implementation to verify:
- Ink v6 + React 19 work together
- ink-scroll-view is compatible
- ink-titled-box renders correctly
- All input libraries function properly

**Decision:** Approved - serves as STOP POINT if critical issues are discovered.

---
