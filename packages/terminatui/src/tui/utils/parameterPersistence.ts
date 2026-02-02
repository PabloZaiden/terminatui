import { join } from "path";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { AppContext } from "../../core/context.ts";

/**
 * Get the file path for storing command parameters.
 * 
 * @param commandName - The command name
 * @returns The path to the parameters file
 */
function getParametersFilePath(commandName: string): string {
    const configDir = AppContext.current.getConfigDir();
    return join(configDir, `${commandName}.parameters.json`);
}

/**
 * Load persisted parameters for a command.
 * 
 * @param _appName - Deprecated, uses AppContext.current.config.name instead
 * @param commandName - The command name
 * @returns The persisted parameters, or an empty object if none exist
 */
export function loadPersistedParameters(
    _appName: string,
    commandName: string
): Record<string, unknown> {
    try {
        const filePath = getParametersFilePath(commandName);
        if (existsSync(filePath)) {
            const content = readFileSync(filePath, "utf-8");
            return JSON.parse(content) as Record<string, unknown>;
        }
    } catch (error) {
        
        // Silently ignore errors - just return empty object
        console.error(`Failed to load persisted parameters: ${error}`);
    }
    return {};
}

/**
 * Save parameters for a command.
 * 
 * @param _appName - Deprecated, uses AppContext.current.config.name instead
 * @param commandName - The command name
 * @param parameters - The parameters to persist
 */
export function savePersistedParameters(
    _appName: string,
    commandName: string,
    parameters: Record<string, unknown>
): void {
    try {
        const filePath = getParametersFilePath(commandName);
        writeFileSync(filePath, JSON.stringify(parameters, null, 2), "utf-8");
    } catch (error) {
        // Silently ignore errors
        console.error(`Failed to save persisted parameters: ${error}`);
    }
}

/**
 * Clear persisted parameters for a command.
 * 
 * @param _appName - Deprecated, uses AppContext.current.config.name instead
 * @param commandName - The command name
 */
export function clearPersistedParameters(
    _appName: string,
    commandName: string
): void {
    try {
        const filePath = getParametersFilePath(commandName);
        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
    } catch (error) {
        // Silently ignore errors
        console.error(`Failed to clear persisted parameters: ${error}`);
    }
}
