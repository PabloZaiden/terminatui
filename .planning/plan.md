# Plan: Add React Web UI Mode to Terminatui

## Overview

This plan outlines the implementation of a new UI mode that renders the Terminatui framework in a React web application. The existing architecture already uses React for TUI rendering with an adapter pattern (Ink, OpenTUI), making it feasible to add a web-based renderer that reuses the semantic layer and controller logic.

---

## Objectives

1. **Add a new `web` mode** to the existing mode system (`cli`, `opentui`, `ink`)
2. **Create a `WebRenderer` adapter** that implements the `Renderer` interface for browser-based React rendering
3. **Implement web-specific semantic screen components** (HTML/CSS equivalents of TUI screens)
4. **Add HTTP server infrastructure** using Bun.serve() to serve the web application
5. **Implement real-time communication** for command execution feedback (WebSocket or SSE)
6. **Optionally create a `WebApplication` class** as a specialized Application subclass for web mode
7. **Ensure feature parity** with existing TUI screens (CommandBrowser, Config, Editor, Logs, Outcome)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Application │  │TuiApplication│  │   WebApplication     │  │
│  │   (base)     │──│  (TUI modes) │  │   (web mode)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Renderer Layer                            │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │InkRenderer │  │OpenTuiRenderer│  │      WebRenderer        │  │
│  │ (terminal) │  │  (terminal)   │  │ (browser + HTTP server) │  │
│  └────────────┘  └─────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Semantic Layer                              │
│   SemanticAppShell, SemanticCommandBrowserScreen,               │
│   SemanticConfigScreen, SemanticEditorModal, etc.               │
│   (Props interfaces remain unchanged - adapters render them)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Tasks

### Phase 1: Foundation Setup

#### Task 1.1: Add `web` mode to type system
**Description:** Update the `SupportedMode` type and related mode handling to include `"web"` as a valid mode option.

**Files to modify:**
- `packages/terminatui/src/types/modes.ts` (or wherever SupportedMode is defined)
- `packages/terminatui/src/core/application.ts` (mode parsing logic)
- `packages/terminatui/src/tui/TuiApplication.tsx` (mode validation)

**Complexity:** Low

**Dependencies:** None

---

#### Task 1.2: Create web directory structure
**Description:** Create the directory structure for web-related code following the existing pattern.

**New directories:**
```
packages/terminatui/src/web/
├── adapters/
│   ├── WebRenderer.tsx
│   └── types.ts
├── components/
│   ├── screens/
│   │   ├── CommandBrowserScreen.tsx
│   │   ├── ConfigScreen.tsx
│   │   ├── OutcomeScreen.tsx
│   │   └── index.ts
│   ├── modals/
│   │   ├── EditorModal.tsx
│   │   ├── LogsModal.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── AppShell.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── index.ts
│   └── index.ts
├── server/
│   ├── HttpServer.ts
│   ├── WebSocketHandler.ts
│   └── index.ts
├── context/
│   └── WebDriverProvider.tsx
├── styles/
│   └── index.css
├── WebApplication.tsx
├── WebRoot.tsx
└── index.ts
```

**Complexity:** Low

**Dependencies:** None

---

### Phase 2: HTTP Server Infrastructure

#### Task 2.1: Implement HTTP server using Bun.serve()
**Description:** Create an HTTP server that serves the React web application. The server should:
- Serve static HTML/CSS/JS assets
- Handle API endpoints for command metadata
- Provide WebSocket upgrade for real-time communication

**Files to create:**
- `packages/terminatui/src/web/server/HttpServer.ts`

**Key features:**
- Start server on configurable port (default: 3000)
- Serve bundled React application
- Expose `/api/commands` endpoint for command registry
- Expose `/api/config` endpoint for application metadata
- WebSocket endpoint at `/ws` for real-time updates

**Complexity:** Medium

**Dependencies:** Task 1.2

---

#### Task 2.2: Implement WebSocket communication layer
**Description:** Create a WebSocket handler for bidirectional communication between the server and web UI.

**Files to create:**
- `packages/terminatui/src/web/server/WebSocketHandler.ts`

**Message types to support:**
- `COMMAND_START` - When a command begins execution
- `COMMAND_OUTPUT` - Stdout/stderr streaming
- `COMMAND_COMPLETE` - Execution finished (success/error)
- `COMMAND_CANCEL` - User cancellation request
- `LOG_EVENT` - Log messages for display
- `NAVIGATION_UPDATE` - Screen/modal changes

**Complexity:** Medium

**Dependencies:** Task 2.1

---

### Phase 3: Web Renderer Adapter

#### Task 3.1: Create WebRenderer class implementing Renderer interface
**Description:** Implement the `Renderer` interface for web-based rendering. This adapter will bridge the semantic layer to React DOM components.

**Files to create:**
- `packages/terminatui/src/web/adapters/WebRenderer.tsx`
- `packages/terminatui/src/web/adapters/types.ts`

**Interface methods to implement:**
```typescript
interface Renderer {
    render(node: ReactNode): void;
    destroy(): void;
    keyboard: KeyboardAdapter;
    
    renderSemanticAppShell(props: AppShellProps): ReactNode;
    renderSemanticCommandBrowserScreen(props: CommandBrowserScreenProps): ReactNode;
    renderSemanticConfigScreen(props: ConfigScreenProps): ReactNode;
    renderSemanticEditorModal(props: EditorModalProps): ReactNode;
    renderSemanticLogsModal(props: LogsModalProps): ReactNode;
    renderSemanticOutcomeScreen(props: OutcomeScreenProps): ReactNode;
}
```

**Complexity:** High

**Dependencies:** Task 1.2, Task 2.2

---

#### Task 3.2: Implement web-specific KeyboardAdapter
**Description:** Create a keyboard adapter that translates browser keyboard events to the framework's keyboard abstraction.

**Files to create:**
- `packages/terminatui/src/web/adapters/WebKeyboardAdapter.ts`

**Key mappings:**
- Arrow keys for navigation
- Enter for selection
- Escape for back/cancel
- Ctrl+C for command cancellation
- Tab for focus movement

**Complexity:** Low

**Dependencies:** Task 3.1

---

### Phase 4: Web UI Components

#### Task 4.1: Implement AppShell component
**Description:** Create the main application shell with header, footer, and content area.

**Files to create:**
- `packages/terminatui/src/web/components/shared/AppShell.tsx`

**Features:**
- Application name and version in header
- Navigation hints/hotkeys in footer
- Responsive layout
- Dark/light theme support

**Complexity:** Low

**Dependencies:** Task 1.2

---

#### Task 4.2: Implement shared UI primitives
**Description:** Create reusable UI components that map to TUI equivalents.

**Files to create:**
- `packages/terminatui/src/web/components/shared/Button.tsx`
- `packages/terminatui/src/web/components/shared/Input.tsx`
- `packages/terminatui/src/web/components/shared/Select.tsx`
- `packages/terminatui/src/web/components/shared/TextArea.tsx`
- `packages/terminatui/src/web/components/shared/Checkbox.tsx`
- `packages/terminatui/src/web/components/shared/JsonHighlight.tsx`

**Complexity:** Medium

**Dependencies:** Task 4.1

---

#### Task 4.3: Implement CommandBrowserScreen
**Description:** Create the command selection screen with search and filtering.

**Files to create:**
- `packages/terminatui/src/web/components/screens/CommandBrowserScreen.tsx`

**Features:**
- List of available commands with descriptions
- Search/filter input
- Keyboard navigation
- Command selection

**Complexity:** Medium

**Dependencies:** Task 4.2

---

#### Task 4.4: Implement ConfigScreen
**Description:** Create the command configuration form screen.

**Files to create:**
- `packages/terminatui/src/web/components/screens/ConfigScreen.tsx`

**Features:**
- Dynamic form generation from OptionSchema
- Field validation with error display
- Required field indicators
- Default value population
- Run button

**Complexity:** High

**Dependencies:** Task 4.2

---

#### Task 4.5: Implement OutcomeScreen (Running/Results/Error states)
**Description:** Create screens for command execution states.

**Files to create:**
- `packages/terminatui/src/web/components/screens/OutcomeScreen.tsx`
- `packages/terminatui/src/web/components/screens/RunningView.tsx`
- `packages/terminatui/src/web/components/screens/ResultsView.tsx`
- `packages/terminatui/src/web/components/screens/ErrorView.tsx`

**Features:**
- Running state with spinner and cancel button
- Real-time output streaming display
- Success/error result display
- Copy-to-clipboard functionality
- Return to config option

**Complexity:** High

**Dependencies:** Task 4.2, Task 2.2

---

#### Task 4.6: Implement EditorModal
**Description:** Create modal for editing complex field values.

**Files to create:**
- `packages/terminatui/src/web/components/modals/EditorModal.tsx`

**Features:**
- Modal overlay
- Multi-line text editing
- JSON validation (for object/array types)
- Save/cancel buttons

**Complexity:** Medium

**Dependencies:** Task 4.2

---

#### Task 4.7: Implement LogsModal
**Description:** Create modal for viewing log output.

**Files to create:**
- `packages/terminatui/src/web/components/modals/LogsModal.tsx`

**Features:**
- Scrollable log display
- Log level filtering
- Real-time log streaming
- Auto-scroll toggle

**Complexity:** Medium

**Dependencies:** Task 4.2

---

### Phase 5: Application Integration

#### Task 5.1: Create WebApplication class
**Description:** Create a new Application subclass specifically for web mode, similar to TuiApplication.

**Files to create:**
- `packages/terminatui/src/web/WebApplication.tsx`

**Features:**
- Extends Application base class
- Handles `web` mode initialization
- Starts HTTP server
- Creates WebRenderer
- Manages web-specific lifecycle

**Complexity:** Medium

**Dependencies:** Task 3.1, Task 2.1

---

#### Task 5.2: Create WebRoot component
**Description:** Create the root React component for the web application.

**Files to create:**
- `packages/terminatui/src/web/WebRoot.tsx`

**Features:**
- Provider tree setup (similar to TuiRoot)
- WebDriver integration
- Error boundaries
- Loading states

**Complexity:** Medium

**Dependencies:** Task 4.1, Task 5.1

---

#### Task 5.3: Integrate WebRenderer with TuiDriver
**Description:** Ensure the WebRenderer works with the existing TuiDriver or create a WebDriver variant.

**Options to consider:**
1. Reuse TuiDriver with web-specific renderer
2. Create new WebDriver with shared interface

**Files to modify/create:**
- `packages/terminatui/src/web/driver/WebDriver.ts` (if new driver needed)
- Or modify `packages/terminatui/src/tui/driver/TuiDriver.ts` for compatibility

**Complexity:** Medium

**Dependencies:** Task 3.1, Task 5.2

---

### Phase 6: Styling and Polish

#### Task 6.1: Create CSS styling system
**Description:** Implement styling for all web components.

**Files to create:**
- `packages/terminatui/src/web/styles/index.css`
- `packages/terminatui/src/web/styles/variables.css`
- `packages/terminatui/src/web/styles/components.css`
- `packages/terminatui/src/web/styles/screens.css`

**Features:**
- CSS custom properties for theming
- Dark/light mode support
- Responsive design
- Consistent with TUI color scheme

**Complexity:** Medium

**Dependencies:** Task 4.1 - 4.7

---

#### Task 6.2: Add keyboard shortcut handling
**Description:** Implement global keyboard shortcuts for the web UI.

**Files to modify:**
- `packages/terminatui/src/web/WebRoot.tsx`
- `packages/terminatui/src/web/adapters/WebKeyboardAdapter.ts`

**Shortcuts to implement:**
- `?` - Show help/hotkeys
- `Esc` - Back/close modal
- `Ctrl+C` - Cancel running command
- `Ctrl+L` - Toggle logs
- Arrow keys - Navigation

**Complexity:** Low

**Dependencies:** Task 3.2

---

### Phase 7: Build and Export

#### Task 7.1: Update package exports
**Description:** Export web-related modules from the package.

**Files to modify:**
- `packages/terminatui/src/index.ts`
- `packages/terminatui/package.json` (if exports field needs updating)

**Complexity:** Low

**Dependencies:** All previous tasks

---

#### Task 7.2: Add build configuration for web assets
**Description:** Configure bundling for the web client assets.

**Files to modify/create:**
- `packages/terminatui/build.ts` or equivalent
- Add HTML template for web app entry point

**Complexity:** Medium

**Dependencies:** Task 7.1

---

### Phase 8: Documentation and Examples

#### Task 8.1: Update example application
**Description:** Update the example TUI app to demonstrate web mode.

**Files to modify:**
- `examples/tui-app/src/index.ts`

**Complexity:** Low

**Dependencies:** Task 7.1

---

#### Task 8.2: Add documentation for web mode
**Description:** Document how to use the web mode.

**Files to create/modify:**
- `guides/web-mode.md`

**Complexity:** Low

**Dependencies:** Task 8.1

---

## Task Dependency Graph

```
Phase 1 (Foundation)
├── Task 1.1: Add web mode type ────────────────────┐
└── Task 1.2: Create directory structure ───────────┤
                                                    │
Phase 2 (Server)                                    │
├── Task 2.1: HTTP server ◄─────────────────────────┤
└── Task 2.2: WebSocket handler ◄───── Task 2.1     │
                                                    │
Phase 3 (Renderer)                                  │
├── Task 3.1: WebRenderer ◄─────────────────────────┤
└── Task 3.2: KeyboardAdapter ◄──── Task 3.1        │
                                                    │
Phase 4 (Components)                                │
├── Task 4.1: AppShell ◄────────────────────────────┘
├── Task 4.2: UI primitives ◄────── Task 4.1
├── Task 4.3: CommandBrowserScreen ◄─ Task 4.2
├── Task 4.4: ConfigScreen ◄───────── Task 4.2
├── Task 4.5: OutcomeScreen ◄──────── Task 4.2, Task 2.2
├── Task 4.6: EditorModal ◄────────── Task 4.2
└── Task 4.7: LogsModal ◄──────────── Task 4.2

Phase 5 (Integration)
├── Task 5.1: WebApplication ◄───── Task 3.1, Task 2.1
├── Task 5.2: WebRoot ◄────────────── Task 4.1, Task 5.1
└── Task 5.3: Driver integration ◄─── Task 3.1, Task 5.2

Phase 6 (Polish)
├── Task 6.1: CSS styling ◄────────── Tasks 4.1-4.7
└── Task 6.2: Keyboard shortcuts ◄─── Task 3.2

Phase 7 (Build)
├── Task 7.1: Package exports ◄────── All previous
└── Task 7.2: Build config ◄───────── Task 7.1

Phase 8 (Docs)
├── Task 8.1: Update examples ◄────── Task 7.1
└── Task 8.2: Documentation ◄──────── Task 8.1
```

---

## Complexity Summary

| Complexity | Tasks | Estimated Effort |
|------------|-------|------------------|
| Low        | 1.1, 1.2, 3.2, 4.1, 6.2, 7.1, 8.1, 8.2 | 1-2 hours each |
| Medium     | 2.1, 2.2, 4.2, 4.3, 4.6, 4.7, 5.1, 5.2, 5.3, 6.1, 7.2 | 2-4 hours each |
| High       | 3.1, 4.4, 4.5 | 4-8 hours each |

**Total estimated effort:** 40-60 hours

---

## Risk Considerations

1. **Real-time streaming complexity:** WebSocket implementation for command output streaming may require careful handling of backpressure and reconnection.

2. **State synchronization:** Keeping web UI state in sync with server-side command execution state.

3. **Bundle size:** Including React DOM and web-specific components will increase package size. Consider code splitting.

4. **Security:** Running an HTTP server exposes the application to network access. Consider:
   - localhost-only binding by default
   - Optional authentication
   - CORS configuration

5. **Browser compatibility:** Target modern browsers (Chrome, Firefox, Safari, Edge latest versions).

---

## Open Questions

1. Should the web mode be a separate entry point or integrated into the existing TuiApplication?
2. Should we support running both TUI and web modes simultaneously?
3. What's the preferred port configuration strategy (fixed, auto-increment, user-specified)?
4. Should the web UI support multiple concurrent users/sessions?
5. Should we bundle a CSS framework (Tailwind, etc.) or use custom CSS?
