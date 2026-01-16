export async function copyToTerminalClipboard(text: string): Promise<boolean> {
    try {
        // Use OSC52 in most terminals; it works across SSH.
        const cleanText = Bun.stripANSI(text);
        const base64 = Buffer.from(cleanText).toString("base64");
        const osc52 = `\x1b]52;c;${base64}\x07`;

        // Write to /dev/tty if possible, else stdout.
        // Bun.write is simplest here.
        try {
            const tty = Bun.file("/dev/tty");
            // If this fails in some envs, we fall back to stdout.
            await Bun.write(tty, osc52);
        } catch {
            process.stdout.write(osc52);
        }

        // Apple Terminal doesn't support OSC52 reliably.
        // Prefer pbcopy when available.
        if (process.env["TERM_PROGRAM"] === "Apple_Terminal") {
            const proc = Bun.spawn(["pbcopy"], {
                stdin: "pipe",
                stdout: "ignore",
                stderr: "ignore",
            });

            proc.stdin.write(cleanText);
            proc.stdin.end();

            const exitCode = await proc.exited;
            return exitCode === 0;
        }

        return true;
    } catch {
        return false;
    }
}
