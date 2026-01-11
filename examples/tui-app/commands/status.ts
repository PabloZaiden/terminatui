import { Command, type CommandResult } from "../../../src/core/command";
import { AppContext } from "../../../src/core/context";
import type { OptionSchema, OptionValues } from "../../../src/types/command";

const statusOptions = {
    detailed: {
        type: "boolean",
        description: "Show detailed status",
        default: false,
        label: "Detailed",
        alias: "d",
        order: 1,
    },
} as const satisfies OptionSchema;

export class StatusCommand extends Command<typeof statusOptions> {
    readonly name = "status";
    override displayName = "Status";
    readonly description = "Show application status";
    readonly options = statusOptions;

    override readonly actionLabel = "Check Status";
    override readonly immediateExecution = true; // No required fields

    override async execute(ctx: AppContext, opts: OptionValues<typeof statusOptions>): Promise<CommandResult> {
        const result = await this.getStatus(opts);
        ctx.logger.info(result.message || "Status check complete");
        return result;
    }

    override renderResult(result: CommandResult): string {
        if (!result.success) return "❌ Status check failed";
        const data = result.data as { uptime: string; memory: string; platform: string; version: string };
        return [
            "✓ Application Status",
            "",
            `  Uptime:   ${data.uptime}`,
            `  Memory:   ${data.memory}`,
            `  Platform: ${data.platform}`,
            `  Bun:      ${data.version}`,
        ].join("\n");
    }

    private async getStatus(opts: OptionValues<typeof statusOptions>): Promise<CommandResult> {
        const detailed = opts.detailed as boolean;
        
        // Simulate some async work
        await new Promise(resolve => {
            let count = 0;
            let interval = setInterval(() => {
                count++;
                AppContext.current.logger.info(`Applying configuration... (${count}/5)`);
                if (count >= 5) {
                    clearInterval(interval);
                    resolve(undefined);
                }
            }, 1000);
        });

        const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const uptimeSec = Math.round(process.uptime());

        const data: Record<string, unknown> = {
            uptime: `${uptimeSec} seconds`,
            memory: `${memMB} MB`,
            platform: process.platform,
            version: Bun.version,
        };

        if (detailed) {
            Object.assign(data, {
                cwd: process.cwd(),
                pid: process.pid,
            });
        }

        return {
            success: true,
            data,
            message: "All systems operational",
        };
    }
}
