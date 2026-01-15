## Phase 3: Implement Ink Adapter (Line-Based)

**Status:** ✅ Complete

**Goal:** Provide a functional Ink renderer option (`--renderer ink`) for this project’s semantic TUI layer, using a **line-based terminal UI style** (minimal decoration, no border/overlay parity).

**Critical Note:** Ink v6 is required for React 19 compatibility. Ink v5 does NOT work with React 19.

---

### Task 3.0: Decide Ink UX Constraints

**Status:** ✅ Complete

**Description:** Align on what “Ink support” means for this codebase.

**Done:**
- [x] Adopt a line-based UI style (inspired by `google-gemini/gemini-cli`)
- [x] Treat border/box parity as a non-goal
- [x] Treat ScrollView parity as a non-goal (Ink ScrollView can be a no-op)
- [x] Keep semantic layer renderer-agnostic (no Ink checks in generic components)

---

### Task 3.1: Add Ink Dependencies

**Status:** ✅ Complete

**Description:** Install Ink and minimal widget dependencies needed for input.

**Done:**
- [x] Add Ink v6
- [x] Add `ink-text-input` for text fields
- [x] Add `ink-select-input` for selectable lists

---

### Task 3.2: Implement Ink Renderer

**Status:** ✅ Complete

**Description:** Implement the adapter entrypoint.

**Done:**
- [x] Implement `src/tui/adapters/ink/InkRenderer.tsx`
- [x] Register Ink component mappings

---

### Task 3.3: Implement Ink Keyboard Adapter

**Status:** ✅ Complete

**Description:** Connect Ink’s `useInput` to the project’s keyboard/focus system.

**Done:**
- [x] Implement `src/tui/adapters/ink/keyboard.ts`
- [x] Normalize keys/modifiers into the project’s keyboard events
- [x] Preserve navigation semantics (focus, bubbling, modal-first)

---

### Task 3.4: Implement Semantic Components for Ink

**Status:** ✅ Complete

**Description:** Provide Ink implementations for semantic components.

**Done:**
- [x] Layout-ish components implemented as minimal/no-op where appropriate
- [x] Content components render as plain text with lightweight styling
- [x] Interactive components implemented using Ink ecosystem widgets

Notes:
- `ScrollView` in Ink is currently an intentional no-op.
- `Select` avoids double selection markers (Ink select already provides one).

---

### Task 3.5: Wire Renderer Selection

**Status:** ✅ Complete

**Description:** Allow running either renderer without code changes.

**Done:**
- [x] Support `--renderer ink|opentui`
- [x] Ensure `ink` path boots end-to-end

---

### Task 3.6: Integration Validation

**Status:** ✅ Complete

**Description:** Verify the app is usable under Ink.

**Done:**
- [x] Core flows work under Ink: command selection, config editing, execution, results/logs viewing
- [x] `bun run build` succeeds
- [x] `bun run test` passes

