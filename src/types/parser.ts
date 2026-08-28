export interface ParsedFlag {
  name: string;
  value?: string | boolean | string[];
}

export interface ParsedCommand {
  raw: string;
  binary: 'docker' | 'docker-compose';
  command?: string;           // e.g. 'run', 'ps', 'images', 'stop', 'network', 'volume'
  subcommand?: string;        // e.g. 'ls', 'create', 'inspect', 'rm', 'connect'
  flags: Record<string, any>;
  positionalArgs: string[];
  isValid: boolean;
  validationError?: string;
  suggestedFix?: string;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  syntax: string;
  example: string;
  category: 'containers' | 'images' | 'networks' | 'volumes' | 'compose' | 'debugging' | 'system';
}
