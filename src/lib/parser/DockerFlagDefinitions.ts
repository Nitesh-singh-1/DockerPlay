/**
 * Strict Docker Flag & Schema Definitions
 * Defines allowed flags, value requirements, aliases, and descriptions
 * for authentic Docker CLI parsing and unknown flag rejection.
 */

export interface FlagDef {
  name: string;
  shorthand?: string;
  type: 'boolean' | 'string' | 'array';
  description: string;
  example?: string;
}

export interface CommandSchema {
  command: string;
  subcommand?: string;
  description: string;
  usage: string;
  flags: Record<string, FlagDef>;
  shorthands: Record<string, string>;
  minPositionalArgs?: number;
  maxPositionalArgs?: number;
}

export const DOCKER_COMMAND_SCHEMAS: Record<string, CommandSchema> = {
  run: {
    command: 'run',
    description: 'Create and run a new container from an image',
    usage: 'docker run [OPTIONS] IMAGE [COMMAND] [ARG...]',
    minPositionalArgs: 1,
    flags: {
      detach: { name: 'detach', shorthand: 'd', type: 'boolean', description: 'Run container in background and print container ID' },
      interactive: { name: 'interactive', shorthand: 'i', type: 'boolean', description: 'Keep STDIN open even if not attached' },
      tty: { name: 'tty', shorthand: 't', type: 'boolean', description: 'Allocate a pseudo-TTY' },
      name: { name: 'name', type: 'string', description: 'Assign a name to the container', example: '--name web' },
      publish: { name: 'publish', shorthand: 'p', type: 'array', description: 'Publish a container\'s port(s) to the host', example: '-p 8080:80' },
      'publish-all': { name: 'publish-all', shorthand: 'P', type: 'boolean', description: 'Publish all exposed ports to random ports' },
      volume: { name: 'volume', shorthand: 'v', type: 'array', description: 'Bind mount a volume', example: '-v dbdata:/var/lib/postgresql/data' },
      mount: { name: 'mount', type: 'array', description: 'Attach a filesystem mount to the container', example: '--mount type=volume,src=dbdata,dst=/data' },
      env: { name: 'env', shorthand: 'e', type: 'array', description: 'Set environment variables', example: '-e POSTGRES_PASSWORD=postgres' },
      'env-file': { name: 'env-file', type: 'string', description: 'Read in a file of environment variables' },
      network: { name: 'network', shorthand: 'net', type: 'string', description: 'Connect a container to a network', example: '--network app-net' },
      'network-alias': { name: 'network-alias', type: 'array', description: 'Add network-scoped alias for the container' },
      hostname: { name: 'hostname', shorthand: 'h', type: 'string', description: 'Container host name' },
      restart: { name: 'restart', type: 'string', description: 'Restart policy to apply when a container exits (no, on-failure, always, unless-stopped)' },
      rm: { name: 'rm', type: 'boolean', description: 'Automatically remove the container when it exits' },
      entrypoint: { name: 'entrypoint', type: 'string', description: 'Overwrite the default ENTRYPOINT of the image' },
      workdir: { name: 'workdir', shorthand: 'w', type: 'string', description: 'Working directory inside the container' },
      user: { name: 'user', shorthand: 'u', type: 'string', description: 'Username or UID (format: <name|uid>[:<group|gid>])' },
      'read-only': { name: 'read-only', type: 'boolean', description: 'Mount the container\'s root filesystem as read only' },
      privileged: { name: 'privileged', type: 'boolean', description: 'Give extended privileges to this container' },
      memory: { name: 'memory', shorthand: 'm', type: 'string', description: 'Memory limit (e.g. 512m)' },
      cpus: { name: 'cpus', type: 'string', description: 'Number of CPUs' },
      expose: { name: 'expose', type: 'array', description: 'Expose a port or a range of ports' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      d: 'detach',
      i: 'interactive',
      t: 'tty',
      p: 'publish',
      P: 'publish-all',
      v: 'volume',
      e: 'env',
      w: 'workdir',
      u: 'user',
      m: 'memory',
      h: 'hostname',
    },
  },
  create: {
    command: 'create',
    description: 'Create a new container without starting it',
    usage: 'docker create [OPTIONS] IMAGE [COMMAND] [ARG...]',
    minPositionalArgs: 1,
    flags: {
      name: { name: 'name', type: 'string', description: 'Assign a name to the container' },
      publish: { name: 'publish', shorthand: 'p', type: 'array', description: 'Publish a container\'s port(s) to the host' },
      volume: { name: 'volume', shorthand: 'v', type: 'array', description: 'Bind mount a volume' },
      env: { name: 'env', shorthand: 'e', type: 'array', description: 'Set environment variables' },
      network: { name: 'network', type: 'string', description: 'Connect a container to a network' },
      restart: { name: 'restart', type: 'string', description: 'Restart policy' },
      rm: { name: 'rm', type: 'boolean', description: 'Automatically remove the container when it exits' },
      workdir: { name: 'workdir', shorthand: 'w', type: 'string', description: 'Working directory' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      p: 'publish',
      v: 'volume',
      e: 'env',
      w: 'workdir',
    },
  },
  ps: {
    command: 'ps',
    description: 'List containers',
    usage: 'docker ps [OPTIONS]',
    flags: {
      all: { name: 'all', shorthand: 'a', type: 'boolean', description: 'Show all containers (default shows just running)' },
      quiet: { name: 'quiet', shorthand: 'q', type: 'boolean', description: 'Only display container IDs' },
      filter: { name: 'filter', shorthand: 'f', type: 'array', description: 'Filter output based on conditions provided' },
      format: { name: 'format', type: 'string', description: 'Format output using a custom template' },
      'no-trunc': { name: 'no-trunc', type: 'boolean', description: 'Don\'t truncate output' },
      size: { name: 'size', shorthand: 's', type: 'boolean', description: 'Display total file sizes' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      a: 'all',
      q: 'quiet',
      f: 'filter',
      s: 'size',
    },
  },
  stop: {
    command: 'stop',
    description: 'Stop one or more running containers',
    usage: 'docker stop [OPTIONS] CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      time: { name: 'time', shorthand: 't', type: 'string', description: 'Seconds to wait before killing the container' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      t: 'time',
    },
  },
  start: {
    command: 'start',
    description: 'Start one or more stopped containers',
    usage: 'docker start [OPTIONS] CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      attach: { name: 'attach', shorthand: 'a', type: 'boolean', description: 'Attach STDOUT/STDERR and forward signals' },
      interactive: { name: 'interactive', shorthand: 'i', type: 'boolean', description: 'Attach container\'s STDIN' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      a: 'attach',
      i: 'interactive',
    },
  },
  restart: {
    command: 'restart',
    description: 'Restart one or more containers',
    usage: 'docker restart [OPTIONS] CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      time: { name: 'time', shorthand: 't', type: 'string', description: 'Seconds to wait before killing' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      t: 'time',
    },
  },
  kill: {
    command: 'kill',
    description: 'Kill one or more running containers',
    usage: 'docker kill [OPTIONS] CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      signal: { name: 'signal', shorthand: 's', type: 'string', description: 'Signal to send to the container' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      s: 'signal',
    },
  },
  pause: {
    command: 'pause',
    description: 'Pause all processes within one or more containers',
    usage: 'docker pause CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  unpause: {
    command: 'unpause',
    description: 'Unpause all processes within one or more containers',
    usage: 'docker unpause CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  rm: {
    command: 'rm',
    description: 'Remove one or more containers',
    usage: 'docker rm [OPTIONS] CONTAINER [CONTAINER...]',
    minPositionalArgs: 1,
    flags: {
      force: { name: 'force', shorthand: 'f', type: 'boolean', description: 'Force the removal of a running container (using SIGKILL)' },
      volumes: { name: 'volumes', shorthand: 'v', type: 'boolean', description: 'Remove anonymous volumes associated with the container' },
      link: { name: 'link', shorthand: 'l', type: 'boolean', description: 'Remove the specified link' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      f: 'force',
      v: 'volumes',
      l: 'link',
    },
  },
  rmi: {
    command: 'rmi',
    description: 'Remove one or more images',
    usage: 'docker rmi [OPTIONS] IMAGE [IMAGE...]',
    minPositionalArgs: 1,
    flags: {
      force: { name: 'force', shorthand: 'f', type: 'boolean', description: 'Force removal of the image' },
      'no-prune': { name: 'no-prune', type: 'boolean', description: 'Do not delete untagged parents' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      f: 'force',
    },
  },
  images: {
    command: 'images',
    description: 'List images',
    usage: 'docker images [OPTIONS] [REPOSITORY[:TAG]]',
    flags: {
      all: { name: 'all', shorthand: 'a', type: 'boolean', description: 'Show all images (default hides intermediate images)' },
      quiet: { name: 'quiet', shorthand: 'q', type: 'boolean', description: 'Only show image IDs' },
      filter: { name: 'filter', shorthand: 'f', type: 'array', description: 'Filter output based on conditions provided' },
      format: { name: 'format', type: 'string', description: 'Format output using a custom template' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      a: 'all',
      q: 'quiet',
      f: 'filter',
    },
  },
  pull: {
    command: 'pull',
    description: 'Download an image from a registry',
    usage: 'docker pull [OPTIONS] NAME[:TAG|@DIGEST]',
    minPositionalArgs: 1,
    flags: {
      'all-tags': { name: 'all-tags', shorthand: 'a', type: 'boolean', description: 'Download all tagged images in the repository' },
      quiet: { name: 'quiet', shorthand: 'q', type: 'boolean', description: 'Suppress verbose output' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      a: 'all-tags',
      q: 'quiet',
    },
  },
  build: {
    command: 'build',
    description: 'Build an image from a Dockerfile',
    usage: 'docker build [OPTIONS] PATH | URL | -',
    minPositionalArgs: 1,
    flags: {
      tag: { name: 'tag', shorthand: 't', type: 'array', description: 'Name and optionally a tag in the \'name:tag\' format' },
      file: { name: 'file', shorthand: 'f', type: 'string', description: 'Name of the Dockerfile (Default is \'PATH/Dockerfile\')' },
      'no-cache': { name: 'no-cache', type: 'boolean', description: 'Do not use cache when building the image' },
      'build-arg': { name: 'build-arg', type: 'array', description: 'Set build-time variables' },
      target: { name: 'target', type: 'string', description: 'Set the target build stage to build' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      t: 'tag',
      f: 'file',
    },
  },
  tag: {
    command: 'tag',
    description: 'Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE',
    usage: 'docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]',
    minPositionalArgs: 2,
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  logs: {
    command: 'logs',
    description: 'Fetch the logs of a container',
    usage: 'docker logs [OPTIONS] CONTAINER',
    minPositionalArgs: 1,
    flags: {
      follow: { name: 'follow', shorthand: 'f', type: 'boolean', description: 'Follow log output' },
      tail: { name: 'tail', shorthand: 'n', type: 'string', description: 'Number of lines to show from the end of the logs' },
      timestamps: { name: 'timestamps', shorthand: 't', type: 'boolean', description: 'Show timestamps' },
      since: { name: 'since', type: 'string', description: 'Show logs since timestamp' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      f: 'follow',
      n: 'tail',
      t: 'timestamps',
    },
  },
  exec: {
    command: 'exec',
    description: 'Execute a command in a running container',
    usage: 'docker exec [OPTIONS] CONTAINER COMMAND [ARG...]',
    minPositionalArgs: 2,
    flags: {
      interactive: { name: 'interactive', shorthand: 'i', type: 'boolean', description: 'Keep STDIN open even if not attached' },
      tty: { name: 'tty', shorthand: 't', type: 'boolean', description: 'Allocate a pseudo-TTY' },
      detach: { name: 'detach', shorthand: 'd', type: 'boolean', description: 'Detached mode: run command in the background' },
      workdir: { name: 'workdir', shorthand: 'w', type: 'string', description: 'Working directory inside the container' },
      user: { name: 'user', shorthand: 'u', type: 'string', description: 'Username or UID' },
      env: { name: 'env', shorthand: 'e', type: 'array', description: 'Set environment variables' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      i: 'interactive',
      t: 'tty',
      d: 'detach',
      w: 'workdir',
      u: 'user',
      e: 'env',
    },
  },
  inspect: {
    command: 'inspect',
    description: 'Return low-level information on Docker objects',
    usage: 'docker inspect [OPTIONS] NAME|ID [NAME|ID...]',
    minPositionalArgs: 1,
    flags: {
      format: { name: 'format', shorthand: 'f', type: 'string', description: 'Format output using a custom template' },
      type: { name: 'type', type: 'string', description: 'Return JSON for specified type (container, image, network, volume)' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      f: 'format',
    },
  },
  stats: {
    command: 'stats',
    description: 'Display a live stream of container(s) resource usage statistics',
    usage: 'docker stats [OPTIONS] [CONTAINER...]',
    flags: {
      all: { name: 'all', shorthand: 'a', type: 'boolean', description: 'Show all containers (default shows just running)' },
      'no-stream': { name: 'no-stream', type: 'boolean', description: 'Disable streaming stats and only pull the first result' },
      format: { name: 'format', type: 'string', description: 'Pretty-print images using a Go template' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      a: 'all',
    },
  },
  top: {
    command: 'top',
    description: 'Display the running processes of a container',
    usage: 'docker top CONTAINER [ps OPTIONS]',
    minPositionalArgs: 1,
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  network: {
    command: 'network',
    description: 'Manage networks',
    usage: 'docker network COMMAND',
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  volume: {
    command: 'volume',
    description: 'Manage volumes',
    usage: 'docker volume COMMAND',
    flags: {
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {},
  },
  compose: {
    command: 'compose',
    description: 'Docker Compose orchestration',
    usage: 'docker compose [COMMAND]',
    flags: {
      file: { name: 'file', shorthand: 'f', type: 'string', description: 'Compose configuration files' },
      'project-name': { name: 'project-name', shorthand: 'p', type: 'string', description: 'Project name' },
      help: { name: 'help', type: 'boolean', description: 'Print usage' },
    },
    shorthands: {
      f: 'file',
      p: 'project-name',
    },
  },
};

/**
 * Fuzzy matching helper for flag and command suggestions (Levenshtein distance)
 */
export function findClosestMatch(input: string, candidates: string[]): string | null {
  if (!candidates || candidates.length === 0) return null;
  let minDistance = Infinity;
  let bestMatch: string | null = null;

  for (const cand of candidates) {
    const dist = levenshteinDistance(input.toLowerCase(), cand.toLowerCase());
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      bestMatch = cand;
    }
  }
  return bestMatch;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
