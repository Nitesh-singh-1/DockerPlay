export interface EducationalError {
  title: string;
  entered: string;
  expected: string;
  example: string;
  why: string;
  documentationLink?: string;
}

export interface ParsedCommand {
  raw: string;
  binary: 'docker' | 'docker-compose';
  command?: string;           // e.g. 'run', 'ps', 'images', 'stop', 'network', 'volume', 'create'
  subcommand?: string;        // e.g. 'ls', 'create', 'inspect', 'rm', 'connect', 'up', 'down'
  flags: Record<string, any>;
  positionalArgs: string[];
  isValid: boolean;
  validationError?: string;
  suggestedFix?: string;
  educationalError?: EducationalError;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  syntax: string;
  example: string;
  category: 'containers' | 'images' | 'networks' | 'volumes' | 'compose' | 'debugging' | 'system';
}
