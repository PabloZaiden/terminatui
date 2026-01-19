# Guide 7: Async Commands with Cancellation (Complex)

Build commands that support cancellation with proper cleanup for long-running operations.

## What You'll Build

A download manager that:
- Downloads files asynchronously
- Shows progress updates
- Supports cancellation (Ctrl+C in CLI, Esc in TUI)
- Cleans up partial downloads when cancelled

```bash
download https://example.com/large-file.zip --output ./downloads/
```

## Step 1: Define the Command

Create `src/commands/download.ts`:

```typescript
import path from "node:path";
import { 
  Command, 
  ConfigValidationError,
  type OptionSchema, 
  type OptionValues,
  type CommandResult,
  type CommandExecutionContext 
} from "@pablozaiden/terminatui";

const options = {
  url: {
    type: "string",
    description: "URL to download",
    required: true,
    label: "Download URL",
  },
  output: {
    type: "string",
    description: "Output directory",
    default: "./downloads",
    label: "Output Directory",
  },
  "chunk-size": {
    type: "string",
    description: "Download chunk size in KB",
    default: "1024",
    label: "Chunk Size (KB)",
  },
} satisfies OptionSchema;

interface DownloadConfig {
  url: URL;
  outputDir: string;
  fileName: string;
  chunkSize: number;
}
```

## Step 2: Implement buildConfig

```typescript
export class DownloadCommand extends Command<typeof options, DownloadConfig> {
  readonly name = "download";
  readonly description = "Download a file from URL";
  readonly options = options;
  readonly displayName = "File Downloader";
  readonly actionLabel = "Download";

  override buildConfig(opts: OptionValues<typeof options>): DownloadConfig {
    // Validate URL
    const urlStr = opts["url"] as string;
    if (!urlStr) {
      throw new ConfigValidationError("URL is required", "url");
    }

    let url: URL;
    try {
      url = new URL(urlStr);
    } catch {
      throw new ConfigValidationError("Invalid URL format", "url");
    }

    // Validate output directory
    const outputDir = path.resolve(opts["output"] as string ?? "./downloads");

    // Extract filename from URL
    const fileName = path.basename(url.pathname) || "download";

    // Parse chunk size
    const chunkSizeStr = opts["chunk-size"] as string ?? "1024";
    const chunkSize = parseInt(chunkSizeStr, 10) * 1024; // Convert KB to bytes
    if (isNaN(chunkSize) || chunkSize <= 0) {
      throw new ConfigValidationError("Chunk size must be a positive number", "chunk-size");
    }

    return { url, outputDir, fileName, chunkSize };
  }
```

## Step 3: Implement Cancellable Download

```typescript
  async execute(
    config: DownloadConfig,
    execCtx: CommandExecutionContext
  ): Promise<CommandResult> {
    const { url, outputDir, fileName, chunkSize } = config;
    const outputPath = path.join(outputDir, fileName);
    const signal = execCtx.signal;

    console.log(`Starting download: ${url}`);
    console.log(`Output: ${outputPath}`);

    // Create output directory
    await Bun.write(path.join(outputDir, ".keep"), "");

    // Track download state for cleanup
    let downloadedBytes = 0;
    let totalBytes = 0;
    let partialFile: Bun.FileSink | null = null;

    try {
      // Check for cancellation before starting
       if (signal.aborted) {

        return { success: false, message: "Download cancelled before start" };
      }

      // Fetch with AbortSignal
      const response = await fetch(url.toString(), { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      totalBytes = parseInt(response.headers.get("content-length") ?? "0", 10);
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error("No response body");
      }

      // Open file for writing
      partialFile = Bun.file(outputPath).writer();

      console.log(`Downloading ${fileName}...`);
      if (totalBytes > 0) {
        console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
      }

      // Read chunks with cancellation checks
      while (true) {
        // Check for cancellation between chunks
      if (signal.aborted) {

          console.warn("Download cancelled by user");
          throw new Error("AbortError");
        }

        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Write chunk
        partialFile.write(value);
        downloadedBytes += value.byteLength;

        // Log progress
        if (totalBytes > 0) {
          const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
          const mbDownloaded = (downloadedBytes / 1024 / 1024).toFixed(2);
          const mbTotal = (totalBytes / 1024 / 1024).toFixed(2);
          Bun.write(Bun.stdout, `\rProgress: ${percent}% (${mbDownloaded}/${mbTotal} MB)`);
        } else {
          const mbDownloaded = (downloadedBytes / 1024 / 1024).toFixed(2);
          Bun.write(Bun.stdout, `\rDownloaded: ${mbDownloaded} MB`);
        }
      }

      // Finalize file
      await partialFile.end();
      console.log("\nDownload complete!");

      return {
        success: true,
        data: {
          file: outputPath,
          size: downloadedBytes,
          url: url.toString(),
        },
        message: `Downloaded ${fileName} (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB)`,
      };

    } catch (error) {
      // Handle cancellation
       if (signal.aborted || (error as Error).name === "AbortError") {

        console.log("\nDownload cancelled.");
        
        // Cleanup partial file
        await this.cleanup(outputPath, partialFile);
        
        return { 
          success: false, 
          message: "Download cancelled by user",
          data: { 
            downloadedBytes,
            cancelled: true,
          },
        };
      }

      // Handle other errors
      await this.cleanup(outputPath, partialFile);
      throw error;
    }
  }

  private async cleanup(
    outputPath: string, 
    sink: Bun.FileSink | null
  ): Promise<void> {
    try {
      // Close file handle
      if (sink) {
        await sink.end();
      }
      
      // Remove partial file
      const file = Bun.file(outputPath);
      if (await file.exists()) {
        await Bun.write(outputPath, ""); // Clear file
        // In production: fs.unlinkSync(outputPath);
        console.log("Cleaned up partial download.");
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
```

## Step 4: Create the Application

Create `src/index.ts`:

```typescript
import { TuiApplication } from "@pablozaiden/terminatui";
import { DownloadCommand } from "./commands/download";

class DownloadManager extends TuiApplication {
  constructor() {
    super({
      name: "download-manager",
      version: "1.0.0",
      commands: [new DownloadCommand()],
    });
  }
}

await new DownloadManager().run();
```

## Step 6: Test Cancellation

```bash
# Start a large download
bun src/index.ts download https://speed.hetzner.de/100MB.bin --output ./test-downloads

# While downloading, press Ctrl+C
# Should see: "Download cancelled. Cleaned up partial download."

# Run TUI mode
bun src/index.ts --mode opentui

# Start download, then press Esc to cancel
# Same cancellation behavior with cleanup
```

## Cancellation Patterns

### 1. Check Signal Before Long Operations

```typescript
if (signal?.aborted) {
  return { success: false, message: "Cancelled" };
}
```

### 2. Pass Signal to fetch/APIs

```typescript
await fetch(url, { signal });
await someAsyncApi({ signal });
```

### 3. Check Between Iterations

```typescript
for (const item of items) {
  if (signal?.aborted) break;
  await processItem(item);
}
```

### 4. Always Cleanup

```typescript
try {
  // ... cancellable work ...
} catch (error) {
  if (signal?.aborted) {
    await cleanup();
    return { success: false, message: "Cancelled" };
  }
  throw error;
}
```

## What You Learned

- Accept `CommandExecutionContext` with `AbortSignal`
- Check `signal.aborted` between operations
- Pass signal to `fetch` and other async APIs
- Clean up resources on cancellation
- Return meaningful results for cancelled operations

## Next Steps

→ [Guide 8: Building a Complete Application](08-complete-application.md)
