export async function copyToTerminalClipboard(text: string): Promise<boolean> {
    try {
        const cleanText = Bun.stripANSI(text);

        // On macOS, prefer pbcopy as it's more reliable than OSC52
        // OSC52 doesn't work well in alternate screen mode (OpenTUI) or Apple Terminal
        if (process.platform === "darwin") {
            try {
                const proc = Bun.spawn(["pbcopy"], {
                    stdin: "pipe",
                    stdout: "ignore",
                    stderr: "ignore",
                });

                proc.stdin.write(cleanText);
                proc.stdin.end();

                const exitCode = await proc.exited;
                if (exitCode === 0) {
                    return true;
                }
            } catch {
                // pbcopy not available, fall through to OSC52
            }
        }

        // On Linux/other, try xclip or xsel first
        if (process.platform === "linux") {
            try {
                const proc = Bun.spawn(["xclip", "-selection", "clipboard"], {
                    stdin: "pipe",
                    stdout: "ignore",
                    stderr: "ignore",
                });

                proc.stdin.write(cleanText);
                proc.stdin.end();

                const exitCode = await proc.exited;
                if (exitCode === 0) {
                    return true;
                }
            } catch {
                // xclip not available, fall through to OSC52
            }
        }

        // Fallback: Use OSC52 in most terminals; it works across SSH.
        const base64 = Buffer.from(cleanText).toString("base64");
        // Use ESC \ as terminator instead of BEL for better compatibility
        const osc52 = `\x1b]52;c;${base64}\x1b\\`;

        // Write to /dev/tty if possible, else stdout.
        try {
            const tty = Bun.file("/dev/tty");
            await Bun.write(tty, osc52);
        } catch {
            process.stdout.write(osc52);
        }

        return true;
    } catch {
        return false;
    }
}
