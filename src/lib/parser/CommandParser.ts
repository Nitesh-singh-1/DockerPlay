import { ParsedCommand, CommandSuggestion } from '@/types/parser';

export class CommandParser {
  /**
   * Tokenizes a command string, properly preserving quoted strings.
   * e.g. docker run -e "MSG=Hello World" -p 8080:80 nginx
   * -> ["docker", "run", "-e", "MSG=Hello World", "-p", "8080:80", "nginx"]
   */
  public static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    const str = input.trim();
    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if ((char === '"' || char === "'") && (!inQuote || quoteChar === char)) {
        if (inQuote) {
          inQuote = false;
          quoteChar = '';
        } else {
          inQuote = true;
          quoteChar = char;
        }
      } else if (char === ' ' && !inQuote) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Parses tokenized CLI input into structured ParsedCommand
   */
  public static parse(input: string): ParsedCommand {
    const raw = input.trim();
    const tokens = this.tokenize(raw);

    if (tokens.length === 0) {
      return {
        raw,
        binary: 'docker',
        flags: {},
        positionalArgs: [],
        isValid: false,
        validationError: 'Empty command.',
      };
    }

    const firstToken = tokens[0].toLowerCase();

    // Check binary
    let binary: 'docker' | 'docker-compose' = 'docker';
    let startIndex = 1;

    if (firstToken === 'docker') {
      binary = 'docker';
    } else if (firstToken === 'docker-compose') {
      binary = 'docker-compose';
    } else if (firstToken === 'clear' || firstToken === 'help' || firstToken === 'reset' || firstToken === 'history') {
      return {
        raw,
        binary: 'docker',
        command: firstToken,
        flags: {},
        positionalArgs: tokens.slice(1),
        isValid: true,
      };
    } else {
      // If user forgot 'docker', e.g. typed 'run nginx' or 'ps', provide friendly fix
      const knownDockerCommands = ['run', 'ps', 'images', 'stop', 'start', 'rm', 'rmi', 'logs', 'exec', 'inspect', 'network', 'volume', 'compose', 'build', 'pull', 'stats', 'top'];
      if (knownDockerCommands.includes(firstToken)) {
        return {
          raw,
          binary: 'docker',
          command: firstToken,
          flags: {},
          positionalArgs: tokens.slice(1),
          isValid: false,
          validationError: `Did you mean: \`docker ${raw}\`?`,
          suggestedFix: `docker ${raw}`,
        };
      }

      return {
        raw,
        binary: 'docker',
        flags: {},
        positionalArgs: tokens,
        isValid: false,
        validationError: `Unknown command: '${firstToken}'. Type 'help' or start with 'docker ...'`,
      };
    }

    if (tokens.length === 1) {
      return {
        raw,
        binary,
        command: '--help',
        flags: { help: true },
        positionalArgs: [],
        isValid: true,
      };
    }

    let command = tokens[startIndex]?.toLowerCase();
    startIndex++;

    // Check for 'docker compose ...' (v2 format)
    if (binary === 'docker' && command === 'compose') {
      binary = 'docker-compose';
      command = tokens[startIndex]?.toLowerCase() || 'ps';
      startIndex++;
    }

    // Check for subcommands like 'docker network create' or 'docker image ls'
    let subcommand: string | undefined = undefined;
    const subresourceCommands = ['network', 'volume', 'image', 'container'];
    if (subresourceCommands.includes(command) && startIndex < tokens.length && !tokens[startIndex].startsWith('-')) {
      subcommand = tokens[startIndex].toLowerCase();
      startIndex++;
    }

    const flags: Record<string, any> = {};
    const positionalArgs: string[] = [];

    // Parse flags and arguments
    let i = startIndex;
    while (i < tokens.length) {
      const token = tokens[i];

      if (token.startsWith('--')) {
        // Long flag: --name web or --name=web or --detach
        const flagBody = token.slice(2);
        if (flagBody.includes('=')) {
          const [key, val] = flagBody.split('=', 2);
          this.setFlagValue(flags, key, val);
        } else {
          // Check if next token is a value or another flag
          const nextToken = tokens[i + 1];
          if (nextToken && !nextToken.startsWith('-') && this.isFlagExpectingValue(flagBody)) {
            this.setFlagValue(flags, flagBody, nextToken);
            i++;
          } else {
            this.setFlagValue(flags, flagBody, true);
          }
        }
      } else if (token.startsWith('-') && token.length > 1) {
        // Short flag(s): -d, -it, -p 8080:80, -e ENV=val
        const shortFlags = token.slice(1);

        if (shortFlags.length === 1) {
          const singleFlag = shortFlags;
          const nextToken = tokens[i + 1];
          if (nextToken && !nextToken.startsWith('-') && this.isShortFlagExpectingValue(singleFlag)) {
            this.setShortFlagValue(flags, singleFlag, nextToken);
            i++;
          } else {
            this.setShortFlagValue(flags, singleFlag, true);
          }
        } else {
          // Combined flags like -it or -d -p etc.
          // Check if last char expects value
          let valueConsumed = false;
          for (let j = 0; j < shortFlags.length; j++) {
            const sf = shortFlags[j];
            if (j === shortFlags.length - 1 && this.isShortFlagExpectingValue(sf)) {
              const nextToken = tokens[i + 1];
              if (nextToken && !nextToken.startsWith('-')) {
                this.setShortFlagValue(flags, sf, nextToken);
                i++;
                valueConsumed = true;
              } else {
                this.setShortFlagValue(flags, sf, true);
              }
            } else {
              this.setShortFlagValue(flags, sf, true);
            }
          }
        }
      } else {
        positionalArgs.push(token);
      }
      i++;
    }

    return {
      raw,
      binary,
      command,
      subcommand,
      flags,
      positionalArgs,
      isValid: true,
    };
  }

  private static isFlagExpectingValue(flagName: string): boolean {
    const valueFlags = [
      'name', 'network', 'net', 'publish', 'port', 'volume', 'env',
      'workdir', 'restart', 'memory', 'cpus', 'tail', 'format',
      'user', 'entrypoint', 'filter'
    ];
    return valueFlags.includes(flagName.toLowerCase());
  }

  private static isShortFlagExpectingValue(flagChar: string): boolean {
    const valueShortFlags = ['p', 'v', 'e', 'w', 'm', 'f'];
    return valueShortFlags.includes(flagChar);
  }

  private static setFlagValue(flags: Record<string, any>, key: string, value: any): void {
    const normalizedKey = this.normalizeFlagKey(key);
    if (['ports', 'publish', 'volume', 'volumes', 'env', 'environment'].includes(normalizedKey)) {
      if (!flags[normalizedKey]) {
        flags[normalizedKey] = [];
      }
      if (Array.isArray(flags[normalizedKey])) {
        flags[normalizedKey].push(value);
      }
    } else {
      flags[normalizedKey] = value;
    }
  }

  private static setShortFlagValue(flags: Record<string, any>, shortChar: string, value: any): void {
    const map: Record<string, string> = {
      d: 'detach',
      i: 'interactive',
      t: 'tty',
      p: 'publish',
      v: 'volume',
      e: 'env',
      a: 'all',
      q: 'quiet',
      f: 'follow',
      w: 'workdir',
      m: 'memory',
    };
    const key = map[shortChar] || shortChar;
    this.setFlagValue(flags, key, value);
  }

  private static normalizeFlagKey(key: string): string {
    const lower = key.toLowerCase();
    const map: Record<string, string> = {
      p: 'publish',
      port: 'publish',
      ports: 'publish',
      v: 'volume',
      volumes: 'volume',
      e: 'env',
      environment: 'env',
      net: 'network',
      d: 'detach',
      i: 'interactive',
      t: 'tty',
      a: 'all',
      q: 'quiet',
    };
    return map[lower] || lower;
  }
}
