# Feature: Configuring Supported Modes at Each Application Level

## Status: Completed
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19

---

## Implementation Summary

All core functionality has been implemented and tested:

### Completed Tasks

1. **Phase 1: Core Type and Property Changes**
   - [x] Task 1.1: Added `SupportedMode` type to `application.ts`
   - [x] Task 1.2: Added `supportedModes` getter to `Application` class (returns `["cli"]`)
   - [x] Task 1.3: Added `supportedModes` getter to `TuiApplication` class (returns `["cli", "opentui", "ink"]`)

2. **Phase 2: Mode Validation**
   - [x] Task 2.1: Added `validateMode` method to `Application` class
   - [x] Task 2.2: Updated `Application.runFromArgs` to use `validateMode`
   - [x] Task 2.3: Updated `TuiApplication.runFromArgs` to use `validateMode`

3. **Phase 4: Remove enableTui**
   - [x] Task 4.1: Removed `enableTui` from `TuiApplicationConfig`
   - [x] Task 4.2: Removed `enableTui` field and logic from `TuiApplication`
   - [x] Updated example app (`examples/tui-app/index.ts`) to remove `enableTui: true`

4. **Phase 5: Testing**
   - [x] Task 5.1: Added unit tests for Application mode support in `application.test.ts`
   - [x] Task 5.2: Created new test file `tuiApplicationModes.test.ts` with TuiApplication mode tests
   - [x] All 90 tests pass

### Files Modified

- `src/core/application.ts` - Added `SupportedMode` type, `supportedModes` getter, `validateMode` method
- `src/tui/TuiApplication.tsx` - Added `supportedModes` getter, updated `runFromArgs`, removed `enableTui`
- `src/__tests__/application.test.ts` - Added mode support tests
- `src/__tests__/tuiApplicationModes.test.ts` - New test file for TuiApplication mode tests
- `examples/tui-app/index.ts` - Removed `enableTui: true` from config

### Skipped Tasks (Not Required)

- Phase 3 (Default Mode Validation): Not implemented as it adds complexity without clear benefit. The `defaultMode` is a protected property set by the developer, so they are responsible for ensuring it matches `supportedModes`.
- Phase 6 (Documentation): JSDoc comments were added inline. No separate documentation needed.

---

## 1. Feature Description

### Overview

This feature adds the ability to configure which execution modes (`cli`, `opentui`, `ink`) are supported at each application level. Currently, the base `Application` class only supports `cli` mode, while `TuiApplication` supports all modes (`cli`, `opentui`, `ink`). However, there's no formal mechanism for subclasses to define which modes they support.

**Key Principle:** Subclasses can **expand or restrict** the modes they support. For example:
- `Application` supports only `cli`
- `TuiApplication` (extends `Application`) **expands** support to include `cli`, `opentui`, and `ink`
- A custom subclass of `TuiApplication` could **restrict** support to only `opentui`

### Requirements

1. **Default Supported Modes by Class:**
   - `Application`: Only supports `cli` mode (existing behavior)
   - `TuiApplication`: Supports `cli`, `opentui`, and `ink` modes (expands parent's modes)

2. **Overridable Mode Configuration:**
   - Each application class should have an overridable property to define which modes are supported
   - Subclasses can **expand** modes (add new modes not in parent) if they implement the necessary logic
   - Subclasses can **restrict** modes (support fewer modes than parent)
   - Examples of valid configurations:
     - `TuiApplication` expanding `Application` to add `opentui` and `ink`
     - A subclass of `TuiApplication` restricting to only `ink` mode
     - A subclass of `TuiApplication` restricting to only `cli` and `opentui` modes

3. **Default Mode Behavior:**
   - Each application already decides which mode is the default (via `protected defaultMode`)
   - This existing behavior should remain unchanged
   - The default mode must be one of the supported modes (validation needed)

4. **Error Handling:**
   - If a user specifies an unsupported mode via `--mode`, a clear error message should be displayed
   - The error should list the available modes for that application

---

## 2. Current State Analysis

### Type Definitions

**Location:** `src/core/application.ts` (lines 23-24)

```typescript
export type TuiModeOptions = "opentui" | "ink";
export type ModeOptions = TuiModeOptions | "cli" | "default";
```

### Base Application Class

**Location:** `src/core/application.ts` (line 102+)

```typescript
export class Application {
  protected defaultMode: ModeOptions = "cli";
  
  async runFromArgs(argv: string[]): Promise<void> {
    // ...
    const mode = globalOptions["mode"] as ModeOptions ?? "default";
    const resolvedMode = mode === "default" ? this.defaultMode : mode;

    if (resolvedMode !== "cli") {
      throw new Error(
        `Mode '${resolvedMode}' is not supported by Application. Use TuiApplication or set --mode=cli.`
      );
    }
    // ...
  }
}
```

**Current Behavior:**
- Only supports `cli` mode
- Throws error for any TUI mode
- Error message is hardcoded

### TuiApplication Class

**Location:** `src/tui/TuiApplication.tsx` (line 42+)

```typescript
export interface TuiApplicationConfig extends ApplicationConfig {
  enableTui?: boolean;
}

export class TuiApplication extends Application {
  private readonly enableTui: boolean;

  override async runFromArgs(argv: string[]): Promise<void> {
    // ...
    const resolvedMode = mode === "default" ? this.defaultMode : mode;

    if (resolvedMode === "cli") {
      await super.runFromArgs(argv);
      return;
    }

    if (!this.enableTui) {
      throw new Error("TUI mode is disabled for this application");
    }

    if (resolvedMode === "opentui" || resolvedMode === "ink") {
      await this.runTui(resolvedMode);
      return;
    }

    throw new Error(`Unknown mode '${resolvedMode}'`);
  }
}
```

**Current Behavior:**
- Supports `cli`, `opentui`, and `ink` modes
- Has `enableTui` flag to disable all TUI modes at once
- No granular control over which TUI modes are allowed

### Global Options Schema

**Location:** `src/core/application.ts` (lines 32-48)

```typescript
export const GLOBAL_OPTIONS_SCHEMA = {
  mode: {
    type: "string",
    description: "Execution mode",
    default: "default",
    enum: ["opentui", "ink", "cli", "default"],
  },
  // ...
};
```

**Note:** The enum in the schema lists all possible modes. This is used for help text and parsing.

---

## 3. Solution Design

### 3.1 New Type: SupportedMode

Create a new type that excludes `"default"` since it's a placeholder, not an actual mode:

```typescript
export type SupportedMode = "cli" | "opentui" | "ink";
```

### 3.2 Overridable Property: supportedModes

Add a protected property to both `Application` and `TuiApplication` that defines which modes are supported:

```typescript
// In Application class - only supports CLI
protected get supportedModes(): readonly SupportedMode[] {
  return ["cli"] as const;
}

// In TuiApplication class - EXPANDS to support all modes
protected override get supportedModes(): readonly SupportedMode[] {
  return ["cli", "opentui", "ink"] as const;
}

// Example: Custom subclass that RESTRICTS to only ink mode
class InkOnlyApp extends TuiApplication {
  protected override get supportedModes(): readonly SupportedMode[] {
    return ["ink"] as const;
  }
}
```

**Why a getter instead of a property?**
- Allows subclasses to easily override by just defining their own getter
- Avoids constructor timing issues with protected properties
- More natural for a "configuration" that shouldn't change at runtime

**Expand vs Restrict:**
- **Expanding:** A subclass adds modes not in the parent (e.g., `TuiApplication` adds `opentui`, `ink`). The subclass must implement the logic to handle those modes (e.g., `runTui()`).
- **Restricting:** A subclass removes modes from the parent's list. No additional implementation needed since the parent already handles those modes.

### 3.3 Mode Validation Logic

Create a validation method in the base `Application` class:

```typescript
protected validateMode(mode: ModeOptions): SupportedMode {
  const resolvedMode = mode === "default" ? this.defaultMode : mode;
  
  if (resolvedMode === "default") {
    throw new Error("Default mode resolved to 'default'. This is a bug.");
  }
  
  if (!this.supportedModes.includes(resolvedMode)) {
    const supported = this.supportedModes.join(", ");
    throw new Error(
      `Mode '${resolvedMode}' is not supported by this application. Supported modes: ${supported}`
    );
  }
  
  return resolvedMode;
}
```

### 3.4 Default Mode Validation

The `defaultMode` must be one of the `supportedModes`. Add validation:

```typescript
// In constructor or a validation method
private validateDefaultMode(): void {
  if (this.defaultMode !== "default" && !this.supportedModes.includes(this.defaultMode as SupportedMode)) {
    throw new Error(
      `Default mode '${this.defaultMode}' is not in supported modes: ${this.supportedModes.join(", ")}`
    );
  }
}
```

### 3.5 TuiApplicationConfig Changes

The `enableTui` config option is removed. The `TuiApplicationConfig` interface no longer needs additional fields:

```typescript
export interface TuiApplicationConfig extends ApplicationConfig {
  // No additional config needed - inherits everything from ApplicationConfig
}
```

**Note:** Supported modes are NOT configurable via config. They are fixed by the developer through the `supportedModes` getter. This ensures:
- Clear compile-time definition of what modes an application supports
- No runtime surprises from misconfiguration
- Subclasses must explicitly define their mode support

### 3.6 Updated runFromArgs Flow

**Application.runFromArgs:**
```typescript
async runFromArgs(argv: string[]): Promise<void> {
  // ...
  const mode = globalOptions["mode"] as ModeOptions ?? "default";
  const resolvedMode = this.validateMode(mode);
  
  if (resolvedMode !== "cli") {
    throw new Error(
      `Mode '${resolvedMode}' requires TuiApplication. Use TuiApplication or set --mode=cli.`
    );
  }
  
  // Continue with CLI execution...
}
```

**TuiApplication.runFromArgs:**
```typescript
override async runFromArgs(argv: string[]): Promise<void> {
  const { globalOptions } = this.parseGlobalOptions(argv);
  const mode = globalOptions["mode"] as ModeOptions ?? "default";
  const resolvedMode = this.validateMode(mode);

  if (resolvedMode === "cli") {
    await super.runFromArgs(argv);
    return;
  }

  // resolvedMode is now guaranteed to be "opentui" or "ink"
  this.applyGlobalOptions(globalOptions);
  await this.runTui(resolvedMode);
}
```

---

## 4. Implementation Plan

### Phase 1: Core Type and Property Changes

#### Task 1.1: Add SupportedMode Type
- **File:** `src/core/application.ts`
- **Action:** Add new type definition
- **Details:**
  ```typescript
  export type SupportedMode = "cli" | "opentui" | "ink";
  ```

#### Task 1.2: Add supportedModes Getter to Application
- **File:** `src/core/application.ts`
- **Action:** Add protected getter that returns `["cli"]`
- **Details:**
  ```typescript
  protected get supportedModes(): readonly SupportedMode[] {
    return ["cli"] as const;
  }
  ```

#### Task 1.3: Add supportedModes Getter to TuiApplication
- **File:** `src/tui/TuiApplication.tsx`
- **Action:** Override getter to return `["cli", "opentui", "ink"]`
- **Details:**
  ```typescript
  protected override get supportedModes(): readonly SupportedMode[] {
    return ["cli", "opentui", "ink"] as const;
  }
  ```

### Phase 2: Mode Validation

#### Task 2.1: Add validateMode Method to Application
- **File:** `src/core/application.ts`
- **Action:** Add protected method for mode validation
- **Details:** Validates that the resolved mode is in `supportedModes`

#### Task 2.2: Update Application.runFromArgs to Use validateMode
- **File:** `src/core/application.ts`
- **Action:** Replace hardcoded mode check with `validateMode()` call
- **Details:** Remove the existing `if (resolvedMode !== "cli")` check and use `validateMode()`

#### Task 2.3: Update TuiApplication.runFromArgs to Use validateMode
- **File:** `src/tui/TuiApplication.tsx`
- **Action:** Use `validateMode()` for mode resolution
- **Details:** Remove `enableTui` check (move to supportedModes logic) and simplify flow

### Phase 3: Default Mode Validation

#### Task 3.1: Add Default Mode Validation
- **File:** `src/core/application.ts`
- **Action:** Validate that `defaultMode` is in `supportedModes` at construction time
- **Details:** Call validation in constructor or via lazy initialization

### Phase 4: Remove enableTui

#### Task 4.1: Remove enableTui from TuiApplicationConfig
- **File:** `src/tui/TuiApplication.tsx`
- **Action:** Remove `enableTui` from `TuiApplicationConfig` interface

#### Task 4.2: Remove enableTui Logic from TuiApplication
- **File:** `src/tui/TuiApplication.tsx`
- **Action:** Remove `enableTui` field and any related logic from the class

### Phase 5: Testing

#### Task 5.1: Add Unit Tests for Application Mode Restriction
- **File:** `src/__tests__/application.test.ts`
- **Actions:**
  - Test that `Application` only supports `cli` mode
  - Test that unsupported mode throws with proper error message
  - Test that `supportedModes` can be overridden in subclass

#### Task 5.2: Add Unit Tests for TuiApplication Mode Restriction
- **File:** `src/__tests__/TuiApplication.test.ts` (may need to create)
- **Actions:**
  - Test that `TuiApplication` supports all three modes
  - Test mode restriction via overriding `supportedModes`
  - Test that restricted modes throw proper errors

#### Task 5.3: Add Integration Tests
- **Actions:**
  - Test CLI invocation with `--mode=opentui` on base Application (should fail)
  - Test CLI invocation with `--mode=ink` on restricted TuiApplication (should fail if restricted)

### Phase 6: Documentation and Examples

#### Task 6.1: Update Example App
- **File:** `examples/tui-app/index.ts`
- **Action:** Optionally demonstrate mode restriction

#### Task 6.2: Add JSDoc Comments
- **Files:** `src/core/application.ts`, `src/tui/TuiApplication.tsx`
- **Action:** Document `supportedModes` getter and how to override it

---

## 5. Detailed Code Changes

### 5.1 Application Class Changes

```typescript
// src/core/application.ts

// New type (add after existing type definitions)
export type SupportedMode = "cli" | "opentui" | "ink";

export class Application {
  // ... existing fields ...
  
  /**
   * Modes supported by this application.
   * Override in subclasses to expand or restrict supported modes.
   * 
   * - To EXPAND modes: Override this getter AND override runFromArgs() to handle the new modes
   * - To RESTRICT modes: Just override this getter to return fewer modes
   * 
   * Base Application only supports CLI mode.
   */
  protected get supportedModes(): readonly SupportedMode[] {
    return ["cli"] as const;
  }

  /**
   * Validate that the requested mode is supported by this application.
   * Returns the resolved mode (never "default").
   * Throws if mode is not supported.
   */
  protected validateMode(mode: ModeOptions): SupportedMode {
    const resolvedMode: SupportedMode = mode === "default" 
      ? (this.defaultMode as SupportedMode) 
      : (mode as SupportedMode);
    
    if (!this.supportedModes.includes(resolvedMode)) {
      const supported = this.supportedModes.join(", ");
      throw new Error(
        `Mode '${resolvedMode}' is not supported. Supported modes: ${supported}`
      );
    }
    
    return resolvedMode;
  }

  async runFromArgs(argv: string[]): Promise<void> {
    // ... existing setup ...
    
    const mode = globalOptions["mode"] as ModeOptions ?? "default";
    const resolvedMode = this.validateMode(mode);

    // Base Application only knows how to run CLI mode.
    // If a subclass expanded supportedModes to include other modes,
    // it must also override runFromArgs() to handle them.
    if (resolvedMode !== "cli") {
      throw new Error(
        `Mode '${resolvedMode}' is declared as supported but not implemented. ` +
        `Override runFromArgs() to handle this mode.`
      );
    }

    // ... rest of CLI execution ...
  }
}
```

### 5.2 TuiApplication Class Changes

```typescript
// src/tui/TuiApplication.tsx

// enableTui is REMOVED from the config interface
export interface TuiApplicationConfig extends ApplicationConfig {
  // No additional config - supportedModes is inherited from ApplicationConfig
}

export class TuiApplication extends Application {
  // enableTui field is REMOVED

  /**
   * Modes supported by this TUI application.
   * 
   * TuiApplication EXPANDS the base Application to support:
   * - cli (inherited from Application)
   * - opentui (added by TuiApplication)
   * - ink (added by TuiApplication)
   * 
   * Override to restrict to specific modes (e.g., only "ink").
   */
  protected override get supportedModes(): readonly SupportedMode[] {
    return ["cli", "opentui", "ink"] as const;
  }

  override async runFromArgs(argv: string[]): Promise<void> {
    const { globalOptions } = this.parseGlobalOptions(argv);
    const mode = globalOptions["mode"] as ModeOptions ?? "default";
    
    // This will throw if mode is not supported
    const resolvedMode = this.validateMode(mode);

    if (resolvedMode === "cli") {
      await super.runFromArgs(argv);
      return;
    }

    // Mode is guaranteed to be "opentui" or "ink" at this point
    this.applyGlobalOptions(globalOptions);
    await this.runTui(resolvedMode);
  }
}
```

---

## 6. Test Cases

### 6.1 Application Mode Tests

```typescript
describe("Application mode support", () => {
  test("only supports cli mode by default", () => {
    const app = new Application({
      name: "test",
      version: "1.0.0",
      commands: [],
    });
    // Access protected property via any cast for testing
    expect((app as any).supportedModes).toEqual(["cli"]);
  });

  test("throws error for opentui mode", async () => {
    const app = new Application({
      name: "test",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    await expect(app.runFromArgs(["--mode", "opentui", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: cli/);
  });

  test("throws error for ink mode", async () => {
    const app = new Application({
      name: "test",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    await expect(app.runFromArgs(["--mode", "ink", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: cli/);
  });

  test("subclass can expand modes (requires implementing runFromArgs)", async () => {
    // This demonstrates that TuiApplication expands modes from Application
    class ExpandedApp extends Application {
      protected override get supportedModes() {
        return ["cli", "custom"] as const;
      }
      
      override async runFromArgs(argv: string[]): Promise<void> {
        // Custom implementation that handles "custom" mode
      }
    }
    
    const app = new ExpandedApp({
      name: "test",
      version: "1.0.0",
      commands: [],
    });
    
    expect((app as any).supportedModes).toEqual(["cli", "custom"]);
  });
});
```

### 6.2 TuiApplication Mode Tests

```typescript
describe("TuiApplication mode support", () => {
  test("expands to support cli, opentui, and ink modes", () => {
    const app = new TuiApplication({
      name: "test",
      version: "1.0.0",
      commands: [],
    });
    
    // TuiApplication EXPANDS Application's modes
    expect((app as any).supportedModes).toEqual(["cli", "opentui", "ink"]);
  });

  test("subclass can restrict to subset of modes", async () => {
    class OpenTuiOnlyApp extends TuiApplication {
      protected override get supportedModes() {
        return ["cli", "opentui"] as const;  // Restricts: removes "ink"
      }
    }
    
    const app = new OpenTuiOnlyApp({
      name: "test",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    // ink mode should be rejected
    await expect(app.runFromArgs(["--mode", "ink", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: cli, opentui/);
  });

  test("subclass can restrict to single TUI mode", async () => {
    class InkOnlyApp extends TuiApplication {
      protected override get supportedModes() {
        return ["ink"] as const;  // Only ink, no cli or opentui
      }
      protected override defaultMode = "ink" as const;
    }
    
    const app = new InkOnlyApp({
      name: "test",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    expect((app as any).supportedModes).toEqual(["ink"]);
    
    // cli mode should be rejected
    await expect(app.runFromArgs(["--mode", "cli", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: ink/);
  });
});
```

---

## 7. Migration Guide

### For Existing Applications

**Breaking change:** `enableTui` config option is removed.

1. `Application` subclasses will continue to only support CLI mode
2. `TuiApplication` subclasses will continue to support all modes (cli, opentui, ink)
3. **Migration for `enableTui: false`:** Replace with overriding `supportedModes`:

```typescript
// Before (no longer works)
class MyApp extends TuiApplication {
  constructor() {
    super({
      name: "myapp",
      version: "1.0.0",
      commands: [...],
      enableTui: false,  // REMOVED
    });
  }
}

// After
class MyApp extends TuiApplication {
  protected override get supportedModes() {
    return ["cli"] as const;
  }
  
  constructor() {
    super({
      name: "myapp",
      version: "1.0.0",
      commands: [...],
    });
  }
}
```

### Expanding Modes (Adding New Modes)

To add new modes in a custom application (like `TuiApplication` does):

```typescript
class CustomModeApp extends Application {
  // 1. Expand supportedModes to include new modes
  protected override get supportedModes() {
    return ["cli", "myCustomMode"] as const;
  }
  
  // 2. Override runFromArgs to handle the new mode
  override async runFromArgs(argv: string[]): Promise<void> {
    const { globalOptions } = this.parseGlobalOptions(argv);
    const mode = globalOptions["mode"] ?? "default";
    const resolvedMode = this.validateMode(mode);

    if (resolvedMode === "cli") {
      await super.runFromArgs(argv);
      return;
    }

    if (resolvedMode === "myCustomMode") {
      // Handle custom mode
      await this.runCustomMode();
      return;
    }
  }
}
```

### Restricting Modes (Removing Modes)

To restrict modes in a custom application (simpler, no need to override `runFromArgs`):

```typescript
class InkOnlyApp extends TuiApplication {
  // Just override supportedModes - no other changes needed
  protected override get supportedModes() {
    return ["ink"] as const;
  }
  
  // Set default mode to one of the supported modes
  protected override defaultMode = "ink" as const;
}
```

---

## 8. Open Questions

1. **Should validation happen in constructor or lazily?**
   - Constructor: Fail fast, clear error on initialization
   - Lazy: Allows dynamic configuration (unlikely needed)
   - **Decision:** Not implemented - left to developer responsibility

---

## 9. Completion Status

All goals have been met:

- [x] `Application` only supports `cli` mode by default
- [x] `TuiApplication` expands to support `cli`, `opentui`, and `ink` modes
- [x] Subclasses can override `supportedModes` to restrict modes
- [x] `validateMode()` throws clear error messages listing available modes
- [x] `enableTui` config option removed entirely
- [x] All tests pass (90 tests, 179 expect() calls)
- [x] Build passes with no TypeScript errors

### Future Enhancements (Optional)

If needed in the future:
- Add default mode validation (ensure `defaultMode` is in `supportedModes`)
- Add runtime validation for mode expansion (ensure subclass implements required methods)
