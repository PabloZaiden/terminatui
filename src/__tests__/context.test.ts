import { describe, test, expect, afterEach } from "bun:test";
import { AppContext, type AppConfig } from "../core/context.ts";
import { existsSync, rmdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

describe("AppContext", () => {
  afterEach(() => {
    AppContext.setCurrent(new AppContext({ name: "empty", version: "0.0.0" }));
  });

  describe("constructor", () => {
    test("creates context with config", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      expect(ctx.config.name).toBe("test");
      expect(ctx.config.version).toBe("1.0.0");
    });

    test("creates context with logger", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      expect(ctx.logger).toBeDefined();
    });
  });

  describe("static current", () => {
    test("returns current context after setCurrent", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      AppContext.setCurrent(ctx);
      expect(AppContext.current).toBe(ctx);
    });
  });

  describe("services", () => {
    test("setService and getService work", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      const service = { value: 42 };
      ctx.setService("myService", service);
      expect(ctx.getService<typeof service>("myService")).toBe(service);
    });

    test("getService returns undefined for unknown service", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      expect(ctx.getService("unknown")).toBeUndefined();
    });

    test("requireService returns service", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      const service = { value: 42 };
      ctx.setService("myService", service);
      expect(ctx.requireService<typeof service>("myService")).toBe(service);
    });

    test("requireService throws for unknown service", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      expect(() => ctx.requireService("unknown")).toThrow(
        "Service 'unknown' not found"
      );
    });

    test("hasService returns correct value", () => {
      const config: AppConfig = { name: "test", version: "1.0.0" };
      const ctx = new AppContext(config);
      expect(ctx.hasService("myService")).toBe(false);
      ctx.setService("myService", {});
      expect(ctx.hasService("myService")).toBe(true);
    });
  });

  describe("getConfigDir", () => {
    test("returns path based on app name", () => {
      const config: AppConfig = { name: "test-app-config", version: "1.0.0" };
      const ctx = new AppContext(config);
      const configDir = ctx.getConfigDir();
      
      // Should be ~/.test-app-config
      expect(configDir).toContain(".test-app-config");
      expect(configDir.startsWith(homedir())).toBe(true);
    });

    test("creates directory if it does not exist", () => {
      const uniqueName = `test-app-${Date.now()}`;
      const config: AppConfig = { name: uniqueName, version: "1.0.0" };
      const ctx = new AppContext(config);
      
      const expectedDir = join(homedir(), `.${uniqueName}`);
      
      // Ensure it doesn't exist before the test
      if (existsSync(expectedDir)) {
        rmdirSync(expectedDir);
      }
      
      const configDir = ctx.getConfigDir();
      
      expect(configDir).toBe(expectedDir);
      expect(existsSync(configDir)).toBe(true);
      
      // Cleanup
      rmdirSync(configDir);
    });

    test("returns same path on repeated calls", () => {
      const config: AppConfig = { name: "test-repeated", version: "1.0.0" };
      const ctx = new AppContext(config);
      
      const configDir1 = ctx.getConfigDir();
      const configDir2 = ctx.getConfigDir();
      
      expect(configDir1).toBe(configDir2);
      
      // Cleanup if created
      if (existsSync(configDir1)) {
        rmdirSync(configDir1);
      }
    });
  });
});
