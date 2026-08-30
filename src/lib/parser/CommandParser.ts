import { ParsedCommand, EducationalError } from '@/types/parser';
import { ShellTokenizer } from './ShellTokenizer';
import { DOCKER_COMMAND_SCHEMAS, findClosestMatch } from './DockerFlagDefinitions';

export class CommandParser {
  /**
   * Tokenizes a command string, properly preserving quotes and escapes
   */
  public static tokenize(input: string): string[] {
    return ShellTokenizer.tokenize(input);
  }

  /**
   * Parses tokenized CLI input into structured ParsedCommand with strict schema validation
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

    // Check for built-in terminal shortcuts
    if (['clear', 'help', 'reset', 'history'].includes(firstToken)) {
      return {
        raw,
        binary: 'docker',
        command: firstToken,
        flags: {},
        positionalArgs: tokens.slice(1),
        isValid: true,
      };
    }

    // Determine binary and start index
    let binary: 'docker' | 'docker-compose' = 'docker';
    let startIndex = 1;

    if (firstToken === 'docker') {
      binary = 'docker';
    } else if (firstToken === 'docker-compose') {
      binary = 'docker-compose';
    } else {
      // Check if user omitted 'docker'
      const knownCommands = Object.keys(DOCKER_COMMAND_SCHEMAS);
      if (knownCommands.includes(firstToken)) {
        return {
          raw,
          binary: 'docker',
          command: firstToken,
          flags: {},
          positionalArgs: tokens.slice(1),
          isValid: false,
          validationError: `docker: '${firstToken}' is a docker command.\n\nDid you mean: \`docker ${raw}\`?`,
          suggestedFix: `docker ${raw}`,
          educationalError: {
            title: 'Missing "docker" prefix',
            entered: raw,
            expected: `docker ${raw}`,
            example: `docker ${raw}`,
            why: 'Docker CLI commands must always start with the `docker` binary name.',
          },
        };
      }

      // Check if user typed a Linux/shell tool (ping, curl, nc, which, cat, ls, etc.)
      const linuxShellTools = ['ping', 'curl', 'nc', 'netcat', 'which', 'telnet', 'nslookup', 'dig', 'traceroute', 'ifconfig', 'ip', 'cat', 'ls', 'env', 'pwd', 'whoami', 'sh', 'bash'];
      if (linuxShellTools.includes(firstToken)) {
        return {
          raw,
          binary: 'docker',
          command: firstToken,
          flags: {},
          positionalArgs: tokens.slice(1),
          isValid: false,
          validationError: `docker: '${firstToken}' is a Linux shell command, not a Docker CLI command.\n\n💡 How to run it in Docker:\nTo execute commands inside an isolated container, use 'docker exec':\n  docker exec <container_name> ${raw}\n\nExample:\n  docker exec api ${raw}\n  docker exec -it api sh`,
          suggestedFix: `docker exec api ${raw}`,
          educationalError: {
            title: `Ran Linux tool "${firstToken}" directly on Docker CLI`,
            entered: raw,
            expected: `docker exec <container> ${raw}`,
            example: `docker exec api ${raw}`,
            why: `Tools like ping, curl, and nc run inside the container's isolated Linux namespace. The Docker CLI communicates with the Docker daemon using commands like 'docker exec', 'docker run', 'docker ps', etc.`,
          },
        };
      }

      // Check if user made a typo for docker
      const closest = findClosestMatch(firstToken, ['docker', 'docker-compose']);
      return {
        raw,
        binary: 'docker',
        flags: {},
        positionalArgs: tokens,
        isValid: false,
        validationError: `docker: command not found: '${firstToken}'${closest ? `\n\nDid you mean: '${closest}'?` : ''}`,
      };
    }

    // Handled `docker` or `docker-compose` with no args
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

    // Check for `docker --help` or `docker -v`
    if (command.startsWith('-')) {
      if (command === '--help' || command === '-h') {
        return {
          raw,
          binary,
          command: '--help',
          flags: { help: true },
          positionalArgs: [],
          isValid: true,
        };
      }
      if (command === '--version' || command === '-v') {
        return {
          raw,
          binary,
          command: 'version',
          flags: {},
          positionalArgs: [],
          isValid: true,
        };
      }
    }

    // Check for `docker compose ...` (v2 format)
    if (binary === 'docker' && command === 'compose') {
      binary = 'docker-compose';
      if (tokens[startIndex] && !tokens[startIndex].startsWith('-')) {
        command = tokens[startIndex].toLowerCase();
        startIndex++;
      } else {
        command = 'compose';
      }
    }

    // Check for subcommands like `docker network create`, `docker volume ls`, `docker image inspect`, `docker container ls`
    let subcommand: string | undefined = undefined;
    const subresourceCommands = ['network', 'volume', 'image', 'container'];
    if (subresourceCommands.includes(command) && startIndex < tokens.length && !tokens[startIndex].startsWith('-')) {
      subcommand = tokens[startIndex].toLowerCase();
      startIndex++;
    }

    // Get Schema for Command
    const schema = DOCKER_COMMAND_SCHEMAS[command];

    // If command is unknown
    if (!schema && command !== 'version') {
      const candidates = Object.keys(DOCKER_COMMAND_SCHEMAS);
      const suggested = findClosestMatch(command, candidates);

      return {
        raw,
        binary,
        command,
        subcommand,
        flags: {},
        positionalArgs: tokens.slice(startIndex),
        isValid: false,
        validationError: `docker: '${command}' is not a docker command.\nSee 'docker --help'${suggested ? `\n\nDid you mean: 'docker ${suggested}'?` : ''}`,
        suggestedFix: suggested ? `docker ${suggested}` : undefined,
        educationalError: {
          title: `Unknown Docker command: "${command}"`,
          entered: `docker ${command}`,
          expected: suggested ? `docker ${suggested}` : 'docker [COMMAND]',
          example: 'docker run -d nginx',
          why: `Docker does not recognize "${command}". Run 'docker --help' to view the list of supported Docker management and container commands.`,
        },
      };
    }

    // Parse Flags & Positional Arguments
    const flags: Record<string, any> = {};
    const positionalArgs: string[] = [];
    let parsingOptions = true;

    for (let i = startIndex; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === '--') {
        // End of options delimiter
        parsingOptions = false;
        continue;
      }

      if (parsingOptions && (token.startsWith('--') || token.startsWith('-'))) {
        // Malformed flag check: triple dash `---name` or invalid colon `-p:8080:80`
        if (token.startsWith('---')) {
          const stripped = token.replace(/^-+/, '');
          return {
            raw,
            binary,
            command,
            subcommand,
            flags,
            positionalArgs,
            isValid: false,
            validationError: `unknown flag: '${token}'\n\nDid you mean:\n  --${stripped}`,
            educationalError: {
              title: `Malformed flag: "${token}"`,
              entered: token,
              expected: `--${stripped}`,
              example: `--${stripped} value`,
              why: 'Docker CLI long options start with exactly two dashes `--`, not three.',
            },
          };
        }

        if (token.startsWith('-p:') || token.startsWith('-v:') || token.startsWith('-e:')) {
          const flagChar = token[1];
          const val = token.slice(3);
          return {
            raw,
            binary,
            command,
            subcommand,
            flags,
            positionalArgs,
            isValid: false,
            validationError: `unknown flag: '${token}'\n\nUse:\n  -${flagChar} ${val}\n\nExample:\n  -${flagChar} 5001:80`,
            educationalError: {
              title: `Invalid flag syntax: "${token}"`,
              entered: token,
              expected: `-${flagChar} ${val}`,
              example: `-${flagChar} 5001:80`,
              why: 'Flags and their argument values must be separated by a space or an equals sign `=`, not a colon `:` after the flag character.',
            },
          };
        }

        // Long Flag (--name web, --name=web, --detach)
        if (token.startsWith('--')) {
          const body = token.slice(2);
          let flagName = body;
          let inlineValue: string | undefined = undefined;

          if (body.includes('=')) {
            const eqIdx = body.indexOf('=');
            flagName = body.slice(0, eqIdx);
            inlineValue = body.slice(eqIdx + 1);
          }

          // Validate against schema if available
          if (schema) {
            const flagDef = schema.flags[flagName];
            if (!flagDef) {
              const allFlagNames = Object.keys(schema.flags).map((f) => `--${f}`);
              const match = findClosestMatch(`--${flagName}`, allFlagNames);
              return {
                raw,
                binary,
                command,
                subcommand,
                flags,
                positionalArgs,
                isValid: false,
                validationError: `unknown flag: '--${flagName}'\nSee 'docker ${command} --help'${match ? `\n\nDid you mean: '${match}'?` : ''}`,
                educationalError: {
                  title: `Unknown option: "--${flagName}" for "docker ${command}"`,
                  entered: `--${flagName}`,
                  expected: match || `valid flag for docker ${command}`,
                  example: `docker ${command} --help`,
                  why: `The "docker ${command}" command does not accept the "--${flagName}" flag.`,
                },
              };
            }

            if (flagDef.type === 'boolean') {
              flags[flagName] = true;
            } else {
              // String or Array flag
              let val = inlineValue;
              if (val === undefined) {
                const next = tokens[i + 1];
                if (!next || next.startsWith('-')) {
                  return {
                    raw,
                    binary,
                    command,
                    subcommand,
                    flags,
                    positionalArgs,
                    isValid: false,
                    validationError: `flag needs an argument: '--${flagName}'\nSee 'docker ${command} --help'`,
                  };
                }
                val = next;
                i++;
              }

              // Specific format validation for volume & port & env
              const error = this.validateFlagValue(flagName, val);
              if (error) return { raw, binary, command, subcommand, flags, positionalArgs, isValid: false, validationError: error.validationError, educationalError: error.educationalError };

              if (flagDef.type === 'array') {
                if (!flags[flagName]) flags[flagName] = [];
                flags[flagName].push(val);
              } else {
                flags[flagName] = val;
              }
            }
          } else {
            flags[flagName] = inlineValue !== undefined ? inlineValue : true;
          }
          continue;
        }

        // Short Flag (-d, -it, -p 8080:80, -p=8080:80, -f)
        if (token.startsWith('-') && token.length > 1) {
          const body = token.slice(1);

          // Check if single short flag with = (e.g. -p=8080:80)
          if (body.includes('=')) {
            const eqIdx = body.indexOf('=');
            const shortChar = body.slice(0, eqIdx);
            const val = body.slice(eqIdx + 1);
            const longName = schema?.shorthands[shortChar] || shortChar;

            const error = this.validateFlagValue(longName, val);
            if (error) return { raw, binary, command, subcommand, flags, positionalArgs, isValid: false, validationError: error.validationError, educationalError: error.educationalError };

            if (schema?.flags[longName]?.type === 'array') {
              if (!flags[longName]) flags[longName] = [];
              flags[longName].push(val);
            } else {
              flags[longName] = val;
            }
            continue;
          }

          // Combined or single short flags
          for (let j = 0; j < body.length; j++) {
            const char = body[j];
            const longName = schema?.shorthands[char] || char;

            if (schema && !schema.shorthands[char] && !schema.flags[char]) {
              return {
                raw,
                binary,
                command,
                subcommand,
                flags,
                positionalArgs,
                isValid: false,
                validationError: `unknown shorthand flag: '-${char}' in '-${body}'\nSee 'docker ${command} --help'`,
              };
            }

            const flagDef = schema?.flags[longName];
            const isLast = j === body.length - 1;

            if (flagDef && flagDef.type !== 'boolean') {
              if (!isLast) {
                // e.g. -p8080:80 (attached value)
                const attachedVal = body.slice(j + 1);
                const error = this.validateFlagValue(longName, attachedVal);
                if (error) return { raw, binary, command, subcommand, flags, positionalArgs, isValid: false, validationError: error.validationError, educationalError: error.educationalError };

                if (flagDef.type === 'array') {
                  if (!flags[longName]) flags[longName] = [];
                  flags[longName].push(attachedVal);
                } else {
                  flags[longName] = attachedVal;
                }
                break;
              } else {
                // Value is in the next token
                const next = tokens[i + 1];
                if (!next || next.startsWith('-')) {
                  return {
                    raw,
                    binary,
                    command,
                    subcommand,
                    flags,
                    positionalArgs,
                    isValid: false,
                    validationError: `flag needs an argument: '-${char}'\nSee 'docker ${command} --help'`,
                  };
                }
                const error = this.validateFlagValue(longName, next);
                if (error) return { raw, binary, command, subcommand, flags, positionalArgs, isValid: false, validationError: error.validationError, educationalError: error.educationalError };

                if (flagDef.type === 'array') {
                  if (!flags[longName]) flags[longName] = [];
                  flags[longName].push(next);
                } else {
                  flags[longName] = next;
                }
                i++;
              }
            } else {
              // Boolean flag
              flags[longName] = true;
            }
          }
          continue;
        }
      }

      // Positional argument
      positionalArgs.push(token);
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

  /**
   * Educational Validation for flag argument formats (-v, -p, -e)
   */
  private static validateFlagValue(
    flagName: string,
    value: string
  ): { validationError: string; educationalError: EducationalError } | null {
    // 1. Volume Mount Validation: -v dbdata (missing colon)
    if (flagName === 'volume') {
      if (!value.includes(':') && !value.startsWith('/')) {
        return {
          validationError: `docker: invalid volume specification: "${value}"\n\nA volume mount requires: -v SOURCE:DESTINATION\nExample: -v ${value}:/var/lib/postgresql/data`,
          educationalError: {
            title: `Invalid volume specification: "${value}"`,
            entered: `-v ${value}`,
            expected: `-v ${value}:/var/lib/postgresql/data`,
            example: `-v ${value}:/var/lib/postgresql/data`,
            why: `Docker needs to know both the host/volume SOURCE and the container DESTINATION mount path separated by a colon ':'.`,
          },
        };
      }
    }

    // 2. Port Validation: -p 8080 (without colon) or bad format
    if (flagName === 'publish') {
      if (!value.includes(':') && isNaN(Number(value))) {
        return {
          validationError: `docker: invalid port specification: "${value}"\n\nExpected: -p HOST_PORT:CONTAINER_PORT\nExample: -p 8080:80`,
          educationalError: {
            title: `Invalid port specification: "${value}"`,
            entered: `-p ${value}`,
            expected: '-p HOST_PORT:CONTAINER_PORT',
            example: '-p 8080:80',
            why: `Port mapping routes network traffic from your machine to the container: hostPort:containerPort.`,
          },
        };
      }
    }

    return null;
  }
}
