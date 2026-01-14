export const KNOWN_COMMANDS = {
  help: "help",
  settings: "settings",
  version: "version",
} as const;

export type KnownCommandName = (typeof KNOWN_COMMANDS)[keyof typeof KNOWN_COMMANDS];

export const RESERVED_TOP_LEVEL_COMMAND_NAMES = new Set<KnownCommandName>([
  KNOWN_COMMANDS.help,
  KNOWN_COMMANDS.settings,
  KNOWN_COMMANDS.version,
]);
