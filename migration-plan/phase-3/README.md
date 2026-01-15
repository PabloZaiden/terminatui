# Phase 3: Implement Ink Adapter (Line-Based)

**Last Updated:** 2026-01-15  
**Prerequisites:** Phase 2 must be complete

---

## Overview

**Status:** ✅ Complete (Phase 3)

Phase 3 delivered a working Ink renderer so the app can run using either renderer:
- `--mode opentui`
- `--mode ink`

Note: execution is controlled by `--mode` (or the app’s default mode).

Unlike OpenTUI (which can do boxes, borders, overlays, and native scrolling), the Ink renderer in this project intentionally follows a **line-based terminal UI** approach (inspired by `google-gemini/gemini-cli`):
- Minimal decoration
- No border/box-based layouts as a primary UI tool
- No overlay/modals that "float" above content as a visual technique
- Prefer plain text, selection markers, and simple sections

The semantic component layer remains renderer-agnostic; the Ink adapter focuses on implementing the same *behaviors* and *flows* using Ink’s strengths.

---

## Critical Note

⚠️ **Ink v6 is required for React 19 compatibility. Ink v5 does NOT work with React 19.**

---

## What Was Implemented

- ✅ Ink renderer selectable via CLI (`--mode ink|opentui|cli|default`)
- ✅ Ink renderer implementation (`src/tui/adapters/ink/**`)
- ✅ Ink keyboard integration via Ink hooks (`useInput`), wired into the project’s keyboard/focus system
- ✅ Semantic component implementations for Ink
  - Layout-ish components are intentionally minimal/no-op where Ink can’t (or shouldn’t) reproduce OpenTUI visuals
  - Interactive components use Ink ecosystem libraries
    - `TextInput`: `ink-text-input`
    - `Select`: `ink-select-input`
- ✅ Full app runs under Ink with acceptable UX for navigation/editing/execution flows

---

## Intentional Differences (Non-Goals)

These are explicitly not Phase 3 goals for Ink:

- **Box/border parity** with OpenTUI
  - Ink can draw borders, but this project’s Ink UI intentionally avoids borders as a design convention.
- **ScrollView parity**
  - The Ink `ScrollView` implementation is currently an intentional no-op. Screens that depend heavily on scrolling should be redesigned to fit the line-based approach.
- **Overlay-style modals**
  - Modals still exist as part of navigation/state, but the Ink renderer does not try to visually “stack” or overlay them.

---

## Documents

### [tasks.md](./tasks.md) - Updated Task List (Completed)
Rewritten tasks list that matches the line-based Ink approach and what was actually implemented.

---

## Phase 3 Completion Checklist

✅ Ink renderer can boot and render the app  
✅ Renderer selection works (`--mode ink|opentui|cli|default`)  
✅ Keyboard navigation and input works under Ink  
✅ Core flows work: select command, edit config, execute, view results/logs  
✅ `bun run build` succeeds  
✅ `bun run test` passes  

---

## Next Steps

Proceed to [Phase 4](../phase-4/README.md) to formalize dual-renderer support, document known differences, and decide which flows must be renderer-parity vs renderer-specific UX.

---

**Related:**
- [Phase 2](../phase-2/README.md)
- [Phase 4](../phase-4/README.md)
- [Main Migration Plan](../README.md)
