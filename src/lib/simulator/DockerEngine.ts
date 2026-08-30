import {
  DockerState,
  Container,
  DockerImage,
  DockerNetwork,
  DockerVolume,
  DockerEvent,
  CommandExecutionResult,
  PortMapping,
  VolumeMount,
  ComposeProject,
} from '@/types/docker';
import { ParsedCommand } from '@/types/parser';
import { DEFAULT_IMAGES } from './DefaultImages';
import { createInitialDockerState } from './DefaultState';
import { generateDockerName } from '../parser/DockerNames';

export type StateListener = (state: DockerState) => void;

export class DockerEngine {
  private state: DockerState;
  private listeners: Set<StateListener> = new Set();
  private ipCounter: number = 2;

  constructor(initialState?: DockerState) {
    this.state = initialState
      ? JSON.parse(JSON.stringify(initialState))
      : createInitialDockerState();
  }

  public getState(): DockerState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const copy = JSON.parse(JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener(copy));
  }

  public reset(presetState?: DockerState): void {
    this.state = presetState
      ? JSON.parse(JSON.stringify(presetState))
      : createInitialDockerState();
    this.recordEvent('daemon', 'reset', 'docker-daemon', 'dockerd', { reason: 'user_reset' });
    this.notify();
  }

  public loadPreset(presetName: string): void {
    if (presetName === 'crash-loop') {
      const id = this.generateId();
      this.state.containers[id] = {
        id,
        name: 'auth-api',
        image: 'node:22-alpine',
        imageId: 'img-node-22',
        command: 'node server.js',
        created: Date.now() - 60000,
        status: 'exited',
        health: 'unhealthy',
        exitCode: 1,
        ports: [],
        networks: {
          bridge: {
            ipAddress: '172.17.0.4',
            gateway: '172.17.0.1',
            aliases: ['auth-api'],
          },
        },
        mounts: [],
        environment: {},
        labels: {},
        logs: [
          { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Initializing Authentication Service v2.4...' },
          { timestamp: new Date().toISOString(), stream: 'stderr', message: 'FATAL: Missing required environment variable DB_HOST' },
          { timestamp: new Date().toISOString(), stream: 'stderr', message: 'Process crashed with code 1' },
        ],
        resources: {
          memoryUsageMb: 0,
          cpuPercent: 0,
          networkRxKb: 0,
          networkTxKb: 0,
          processCount: 0,
        },
        restartPolicy: 'no',
      };
    } else if (presetName === 'port-mismatch') {
      const id = this.generateId();
      this.state.containers[id] = {
        id,
        name: 'web-app',
        image: 'nginx:latest',
        imageId: 'img-nginx',
        command: 'nginx -g "daemon off;"',
        created: Date.now() - 120000,
        status: 'running',
        health: 'healthy',
        exitCode: 0,
        ports: [{ hostPort: 8080, containerPort: 8080, protocol: 'tcp' }],
        networks: {
          bridge: {
            ipAddress: '172.17.0.5',
            gateway: '172.17.0.1',
            aliases: ['web-app'],
          },
        },
        mounts: [],
        environment: {},
        labels: {},
        logs: [
          { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Configuration loaded successfully.' },
          { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Nginx 1.27 listening on internal port 80/tcp' },
        ],
        resources: {
          memoryUsageMb: 15,
          cpuPercent: 0.2,
          networkRxKb: 12,
          networkTxKb: 8,
          processCount: 2,
        },
        restartPolicy: 'no',
      };
    } else if (presetName === 'network-split') {
      if (!this.state.networks['store-net']) {
        this.state.networks['store-net'] = {
          id: `net-${this.generateId(8)}`,
          name: 'store-net',
          driver: 'bridge',
          subnet: '172.28.0.0/16',
          gateway: '172.28.0.1',
          containers: [],
          internal: false,
        };
      }
      const frontId = this.generateId();
      this.state.containers[frontId] = {
        id: frontId,
        name: 'storefront',
        image: 'node:22-alpine',
        imageId: 'img-node-22',
        command: 'npm start',
        created: Date.now() - 180000,
        status: 'running',
        health: 'healthy',
        exitCode: 0,
        ports: [{ hostPort: 3000, containerPort: 3000, protocol: 'tcp' }],
        networks: {
          'store-net': {
            ipAddress: '172.28.0.2',
            gateway: '172.28.0.1',
            aliases: ['storefront'],
          },
        },
        mounts: [],
        environment: { API_URL: 'http://order-api:5000' },
        labels: {},
        logs: [
          { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Storefront React UI listening on :3000' },
          { timestamp: new Date().toISOString(), stream: 'stderr', message: 'getaddrinfo ENOTFOUND order-api: connection failed' },
        ],
        resources: {
          memoryUsageMb: 45,
          cpuPercent: 0.5,
          networkRxKb: 20,
          networkTxKb: 10,
          processCount: 3,
        },
        restartPolicy: 'no',
      };
      this.state.networks['store-net'].containers.push(frontId);

      const orderId = this.generateId();
      this.state.containers[orderId] = {
        id: orderId,
        name: 'order-api',
        image: 'node:22-alpine',
        imageId: 'img-node-22',
        command: 'node order-server.js',
        created: Date.now() - 180000,
        status: 'running',
        health: 'healthy',
        exitCode: 0,
        ports: [{ hostPort: 5000, containerPort: 5000, protocol: 'tcp' }],
        networks: {
          bridge: {
            ipAddress: '172.17.0.6',
            gateway: '172.17.0.1',
            aliases: ['order-api'],
          },
        },
        mounts: [],
        environment: {},
        labels: {},
        logs: [
          { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Order REST API running on port 5000/tcp' },
        ],
        resources: {
          memoryUsageMb: 38,
          cpuPercent: 0.3,
          networkRxKb: 8,
          networkTxKb: 4,
          processCount: 2,
        },
        restartPolicy: 'no',
      };
      this.state.networks['bridge'].containers.push(orderId);
    }
    this.recordEvent('daemon', 'preset_loaded', 'docker-daemon', presetName, { preset: presetName });
    this.notify();
  }

  private generateId(length: number = 12): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private recordEvent(
    type: DockerEvent['type'],
    action: string,
    actorId: string,
    actorName: string,
    attributes: Record<string, string> = {}
  ): DockerEvent {
    const event: DockerEvent = {
      id: `evt-${this.generateId(8)}`,
      timestamp: Date.now(),
      type,
      action,
      actorId,
      actorName,
      attributes,
    };
    this.state.events.unshift(event);
    if (this.state.events.length > 50) {
      this.state.events = this.state.events.slice(0, 50);
    }
    return event;
  }

  /**
   * Main dispatch entry point for CLI execution
   */
  public execute(parsed: ParsedCommand): CommandExecutionResult {
    // If validation failed at parser level
    if (!parsed.isValid) {
      return {
        stdout: '',
        stderr: parsed.validationError || 'Invalid command syntax.',
        exitCode: 1,
        explanation: parsed.educationalError ? {
          title: parsed.educationalError.title,
          summary: parsed.educationalError.why,
          steps: [
            `You entered: ${parsed.educationalError.entered}`,
            `Docker expects: ${parsed.educationalError.expected}`,
            `Example: ${parsed.educationalError.example}`,
          ],
          why: parsed.educationalError.why,
        } : undefined,
      };
    }

    if (parsed.binary === 'docker-compose') {
      return this.handleComposeCommand(parsed);
    }

    switch (parsed.command) {
      case 'run':
        return this.handleRun(parsed, true);
      case 'create':
        return this.handleRun(parsed, false);
      case 'ps':
        return this.handlePs(parsed);
      case 'images':
      case 'image':
        if (parsed.subcommand === 'ls' || !parsed.subcommand) {
          return this.handleImages(parsed);
        } else if (parsed.subcommand === 'rm' || parsed.subcommand === 'rmi') {
          return this.handleRmi(parsed);
        } else if (parsed.subcommand === 'inspect') {
          return this.handleInspect(parsed);
        } else if (parsed.subcommand === 'prune') {
          return this.handleImagePrune(parsed);
        }
        return this.handleImages(parsed);
      case 'pull':
        return this.handlePull(parsed);
      case 'stop':
        return this.handleStop(parsed);
      case 'start':
        return this.handleStart(parsed);
      case 'restart':
        return this.handleRestart(parsed);
      case 'kill':
        return this.handleKill(parsed);
      case 'pause':
        return this.handlePause(parsed);
      case 'unpause':
        return this.handleUnpause(parsed);
      case 'rm':
        return this.handleRm(parsed);
      case 'rmi':
        return this.handleRmi(parsed);
      case 'logs':
        return this.handleLogs(parsed);
      case 'exec':
        return this.handleExec(parsed);
      case 'inspect':
        return this.handleInspect(parsed);
      case 'stats':
        return this.handleStats(parsed);
      case 'top':
        return this.handleTop(parsed);
      case 'network':
        return this.handleNetwork(parsed);
      case 'volume':
        return this.handleVolume(parsed);
      case 'build':
        return this.handleBuild(parsed);
      case 'tag':
        return this.handleTag(parsed);
      case 'version':
        return {
          stdout: `Client: Docker Engine - Community\n Version:           27.1.1\n API version:       1.46\n Go version:        go1.22.5\n Git commit:        6312585\n Built:             Fri Jul 19 12:00:00 2026\n OS/Arch:           linux/amd64\n Context:           default\n\nServer: Docker Engine - Community\n Engine:\n  Version:          27.1.1\n  API version:      1.46 (minimum version 1.24)\n  Go version:       go1.22.5\n  Git commit:       cc13f95\n  Built:            Fri Jul 19 12:00:00 2026\n  OS/Arch:          linux/amd64\n  Experimental:     false`,
          stderr: '',
          exitCode: 0,
        };
      case 'clear':
        return { stdout: '__CLEAR__', stderr: '', exitCode: 0 };
      case 'help':
      case '--help':
        return this.handleHelp();
      default:
        return {
          stdout: '',
          stderr: `docker: '${parsed.command}' is not a docker command.\nSee 'docker --help'`,
          exitCode: 1,
        };
    }
  }

  // =================== COMMAND HANDLERS ===================

  /**
   * Handles both `docker run` (startNow = true) and `docker create` (startNow = false)
   */
  private handleRun(parsed: ParsedCommand, startNow: boolean): CommandExecutionResult {
    const isCreate = !startNow;
    const actionName = isCreate ? 'create' : 'run';

    if (parsed.flags.help) {
      return {
        stdout: `Usage:  docker ${actionName} [OPTIONS] IMAGE [COMMAND] [ARG...]\n\n${isCreate ? 'Create a new container' : 'Create and run a new container from an image'}\n\nOptions:\n  -d, --detach                         Run container in background\n  -e, --env list                       Set environment variables\n      --name string                    Assign a name to the container\n      --network network                Connect a container to a network\n  -p, --publish list                   Publish a container's port(s) to the host\n      --restart string                 Restart policy (default "no")\n      --rm                             Automatically remove the container when it exits\n  -v, --volume list                    Bind mount a volume\n  -w, --workdir string                 Working directory inside the container`,
        stderr: '',
        exitCode: 0,
      };
    }

    const imageName = parsed.positionalArgs[0];
    if (!imageName) {
      return {
        stdout: '',
        stderr: `"docker ${actionName}" requires at least 1 argument.\nSee 'docker ${actionName} --help'.\n\nUsage:  docker ${actionName} [OPTIONS] IMAGE [COMMAND] [ARG...]`,
        exitCode: 1,
        explanation: {
          title: `Missing image argument for "docker ${actionName}"`,
          summary: `You called "docker ${actionName}" without specifying which image blueprint to use.`,
          steps: [
            `Docker requires an image name, e.g.: docker ${actionName} nginx`,
            `Example with options: docker ${actionName} -d --name web -p 8080:80 nginx:alpine`,
          ],
          why: `Containers cannot exist without a base image layer containing their filesystem and runtime.`,
        },
      };
    }

    // Resolve or Auto-pull Image
    let imageKey = imageName.includes(':') ? imageName : `${imageName}:latest`;
    let image = this.state.images[imageKey];
    let pullLogs = '';

    if (!image) {
      const template = DEFAULT_IMAGES[imageKey] || DEFAULT_IMAGES[`${imageName}:latest`];
      if (template) {
        const foundKey = DEFAULT_IMAGES[imageKey] ? imageKey : `${imageName}:latest`;
        this.state.images[foundKey] = { ...DEFAULT_IMAGES[foundKey] };
        image = this.state.images[foundKey];
        imageKey = foundKey;
        pullLogs = `Unable to find image '${imageName}' locally\n${image.tag}: Pulling from library/${image.repository}\n` +
          `Layer 1/3 [===================>] 7.8MB/7.8MB\n` +
          `Layer 2/3 [===================>] 28MB/28MB\n` +
          `Layer 3/3 [===================>] 4.2MB/4.2MB\n` +
          `Digest: sha256:${this.generateId(32)}\nStatus: Downloaded newer image for ${imageKey}\n`;
        this.recordEvent('image', 'pull', image.id, imageKey);
      } else {
        // Auto-create lightweight simulated image
        const newImg: DockerImage = {
          id: `sha256:${this.generateId(12)}`,
          repository: imageName.split(':')[0],
          tag: imageName.split(':')[1] || 'latest',
          sizeMb: 54,
          created: Date.now(),
          exposedPorts: [80],
          env: {},
          workdir: '/app',
          cmd: ['sh'],
          layers: [{ id: `sha256:${this.generateId(8)}`, instruction: `FROM ${imageName}`, sizeMb: 54, cached: false, command: imageName }],
        };
        this.state.images[imageKey] = newImg;
        image = newImg;
        pullLogs = `Unable to find image '${imageName}' locally\nPulling from library/${imageName}...\nStatus: Downloaded newer image for ${imageKey}\n`;
      }
    }

    // Container Name Resolution (Strict uniqueness or authentic Docker random name)
    let containerName = parsed.flags.name;
    if (containerName) {
      if (Object.values(this.state.containers).some((c) => c.name === containerName)) {
        return {
          stdout: '',
          stderr: `docker: Error response from daemon: Conflict. The container name "/${containerName}" is already in use by container "${this.findContainer(containerName)?.id.slice(0, 12)}". You have to remove (or rename) that container to be able to reuse that name.`,
          exitCode: 1,
          explanation: {
            title: `Container name conflict: "/${containerName}"`,
            summary: `A container with the name "${containerName}" already exists in the Docker runtime.`,
            steps: [
              `Run 'docker ps -a' to see all existing containers.`,
              `Either choose a different name: --name ${containerName}-2`,
              `Or stop & remove the existing container: docker rm -f ${containerName}`,
            ],
            why: `Docker guarantees deterministic name-to-container mapping so internal DNS and CLI references remain unambiguous.`,
          },
        };
      }
    } else {
      const existingNames = Object.values(this.state.containers).map((c) => c.name);
      containerName = generateDockerName(existingNames);
    }

    // Parse & Validate Ports
    const ports: PortMapping[] = [];
    const portFlags = Array.isArray(parsed.flags.publish)
      ? parsed.flags.publish
      : parsed.flags.publish
      ? [parsed.flags.publish]
      : [];

    for (const p of portFlags) {
      const parts = String(p).split(':');
      if (parts.length === 2) {
        const hostPort = parseInt(parts[0], 10);
        const containerPort = parseInt(parts[1], 10);

        if (isNaN(hostPort) || isNaN(containerPort)) {
          return {
            stdout: '',
            stderr: `docker: Invalid port specification: "${p}"`,
            exitCode: 1,
          };
        }

        // Port conflict check among active running containers
        if (startNow) {
          for (const c of Object.values(this.state.containers)) {
            if (c.status === 'running') {
              const conflict = c.ports.find((pm) => pm.hostPort === hostPort);
              if (conflict) {
                return {
                  stdout: '',
                  stderr: `docker: Error response from daemon: driver failed programming external connectivity on endpoint ${containerName}: Bind for 0.0.0.0:${hostPort} failed: port is already allocated.`,
                  exitCode: 1,
                  explanation: {
                    title: `Port collision on host port :${hostPort}`,
                    summary: `Host port ${hostPort} is already actively bound by container "${c.name}".`,
                    steps: [
                      `Container "${c.name}" is listening on port ${hostPort}.`,
                      `Choose a different host port: -p ${hostPort + 1}:${containerPort}`,
                      `Or stop the existing container: docker stop ${c.name}`,
                    ],
                    why: `Operating system network stacks only permit one process or container to listen on a given host TCP port at a time.`,
                  },
                };
              }
            }
          }
        }
        ports.push({ hostPort, containerPort, protocol: 'tcp' });
      } else if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
        // Expose container port
        const containerPort = parseInt(parts[0], 10);
        ports.push({ hostPort: containerPort + 1000, containerPort, protocol: 'tcp' });
      }
    }

    // Parse & Validate Network
    const networkName = parsed.flags.network || 'bridge';
    const targetNetwork = this.state.networks[networkName];
    if (!targetNetwork) {
      return {
        stdout: '',
        stderr: `docker: Error response from daemon: network ${networkName} not found\n\nHint: create it first using 'docker network create ${networkName}'`,
        exitCode: 1,
        explanation: {
          title: `Network "${networkName}" not found`,
          summary: `You asked Docker to attach container "${containerName}" to network "${networkName}", but this network does not exist.`,
          steps: [
            `Create the network first: docker network create ${networkName}`,
            `Then run your container: docker run -d --name ${containerName} --network ${networkName} ${imageKey}`,
          ],
          why: `Docker cannot bridge or assign IP routes across non-existent virtual network bridges.`,
        },
      };
    }

    // Parse & Validate Volumes (Persistent Decoupled Storage)
    const mounts: VolumeMount[] = [];
    const volFlags = Array.isArray(parsed.flags.volume)
      ? parsed.flags.volume
      : parsed.flags.volume
      ? [parsed.flags.volume]
      : [];

    for (const v of volFlags) {
      const parts = String(v).split(':');
      if (parts.length >= 2) {
        const source = parts[0];
        const dest = parts[1];
        const isBind = source.startsWith('.') || source.startsWith('/') || source.includes('\\');

        if (!isBind && !this.state.volumes[source]) {
          // Auto-create named volume in central state so it persists
          this.state.volumes[source] = {
            id: `vol-${this.generateId(8)}`,
            name: source,
            driver: 'local',
            mountpoint: `/var/lib/docker/volumes/${source}/_data`,
            sizeMb: 0,
            created: Date.now(),
            data: {},
          };
          this.recordEvent('volume', 'create', source, source);
        }

        mounts.push({
          source,
          destination: dest,
          type: isBind ? 'bind' : 'volume',
          readonly: parts[2] === 'ro',
        });
      }
    }

    // Parse Environment Variables with Case-Sensitivity Educational Warning
    const env: Record<string, string> = { ...image.env };
    let envWarning = '';
    const envFlags = Array.isArray(parsed.flags.env)
      ? parsed.flags.env
      : parsed.flags.env
      ? [parsed.flags.env]
      : [];

    for (const e of envFlags) {
      const [k, v] = String(e).split('=');
      if (k) {
        env[k] = v || '';
        if (imageKey.includes('postgres') && k.toLowerCase() === 'postgres_password' && k !== 'POSTGRES_PASSWORD') {
          envWarning = `\n⚠ Warning: PostgreSQL commonly expects uppercase 'POSTGRES_PASSWORD'. Environment variables in Docker are case-sensitive.`;
        }
      }
    }

    const containerId = this.generateId(12);
    const assignedIp = `172.${networkName === 'bridge' ? '17' : '20'}.0.${this.ipCounter++}`;
    const isDetached = Boolean(parsed.flags.detach);
    const cmdArgs = parsed.positionalArgs.slice(1);
    const finalCmd = cmdArgs.length > 0 ? cmdArgs.join(' ') : image.cmd.join(' ');
    const logs = this.generateMockLogs(image.repository, containerName, ports);

    const newContainer: Container = {
      id: containerId,
      name: containerName,
      image: imageKey,
      imageId: image.id,
      status: startNow ? 'running' : 'created',
      health: startNow ? 'healthy' : 'none',
      command: finalCmd,
      created: Date.now(),
      startedAt: startNow ? Date.now() : undefined,
      ports,
      environment: env,
      networks: {
        [networkName]: {
          ipAddress: assignedIp,
          gateway: targetNetwork.gateway || '172.17.0.1',
          aliases: [containerName],
        },
      },
      mounts,
      labels: {},
      logs: startNow ? logs : [],
      resources: {
        memoryUsageMb: startNow ? Math.floor(Math.random() * 30 + 15) : 0,
        cpuPercent: startNow ? parseFloat((Math.random() * 1.5 + 0.1).toFixed(1)) : 0,
        networkRxKb: startNow ? 142 : 0,
        networkTxKb: startNow ? 89 : 0,
        processCount: startNow ? 2 : 0,
        memoryLimitMb: parsed.flags.memory ? parseInt(parsed.flags.memory, 10) : undefined,
      },
      restartPolicy: parsed.flags.restart || 'no',
    };

    // Attach to central state & network
    this.state.containers[containerId] = newContainer;
    targetNetwork.containers.push(containerId);

    this.recordEvent('container', 'create', containerId, containerName, { image: imageKey });
    if (startNow) {
      this.recordEvent('container', 'start', containerId, containerName, { image: imageKey });
    }
    this.notify();

    // Beginner Mode Breakdown Chips
    const beginnerBreakdown = [
      { token: 'docker', role: 'CLI Binary', description: 'Docker CLI command dispatcher' },
      { token: actionName, role: 'Command', description: isCreate ? 'Creates container layer without starting execution' : 'Creates container and starts execution' },
    ];
    if (isDetached) {
      beginnerBreakdown.push({ token: '-d', role: 'Flag', description: 'Detaches from container output to run in background' });
    }
    if (parsed.flags.name) {
      beginnerBreakdown.push({ token: `--name ${containerName}`, role: 'Flag', description: `Assigns explicit name "${containerName}"` });
    }
    if (ports.length > 0) {
      beginnerBreakdown.push({ token: `-p ${ports[0].hostPort}:${ports[0].containerPort}`, role: 'Flag', description: `Forwards localhost:${ports[0].hostPort} -> container :${ports[0].containerPort}` });
    }
    if (mounts.length > 0) {
      beginnerBreakdown.push({ token: `-v ${mounts[0].source}:${mounts[0].destination}`, role: 'Flag', description: `Mounts persistent storage "${mounts[0].source}" at ${mounts[0].destination}` });
    }
    if (networkName !== 'bridge') {
      beginnerBreakdown.push({ token: `--network ${networkName}`, role: 'Flag', description: `Connects to "${networkName}" with automatic DNS resolution` });
    }
    beginnerBreakdown.push({ token: imageKey, role: 'Base Image', description: `Immutable template blueprint` });

    const outputText = `${pullLogs}${isDetached || isCreate ? containerId : `[${containerName}] Running in foreground (Ctrl+C to stop)...\n` + logs.map((l) => l.message).join('\n')}${envWarning}`;

    return {
      stdout: outputText,
      stderr: '',
      exitCode: 0,
      explanation: {
        title: isCreate ? `Container "${containerName}" Created` : `Container "${containerName}" Started`,
        summary: `Initialized ${isCreate ? 'stopped' : 'running'} container from image "${imageKey}" on network "${networkName}".`,
        steps: [
          `Allocated unique container ID ${containerId.slice(0, 12)} and assigned name "${containerName}".`,
          `Connected container interface to "${networkName}" with IP ${assignedIp}.`,
          mounts.length > 0 ? `Mounted volume "${mounts[0].source}" to "${mounts[0].destination}".` : 'No custom volumes mounted.',
          ports.length > 0 ? `Configured port NAT forwarding: localhost:${ports[0].hostPort} -> :${ports[0].containerPort}.` : 'No host ports published.',
          startNow ? `Started primary process "${finalCmd}".` : 'Container is in "created" state. Start it using `docker start ' + containerName + '`.',
        ],
        why: isCreate
          ? '`docker create` provisions the writeable container layer and configurations without executing PID 1 yet.'
          : 'Containers execute processes in isolated Linux namespaces sharing the host kernel with strict cgroups limits.',
      },
      beginnerBreakdown,
      affectedResources: [{ type: 'container', id: containerId, action: isCreate ? 'create' : 'start' }],
    };
  }

  /**
   * `docker ps` / `docker ps -a`
   */
  private handlePs(parsed: ParsedCommand): CommandExecutionResult {
    const showAll = Boolean(parsed.flags.all || parsed.flags.a);
    const quiet = Boolean(parsed.flags.quiet || parsed.flags.q);

    let containers = Object.values(this.state.containers);
    if (!showAll) {
      containers = containers.filter((c) => c.status === 'running' || c.status === 'restarting');
    }

    if (quiet) {
      return {
        stdout: containers.map((c) => c.id.slice(0, 12)).join('\n'),
        stderr: '',
        exitCode: 0,
      };
    }

    if (containers.length === 0) {
      return {
        stdout: 'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS    PORTS     NAMES',
        stderr: '',
        exitCode: 0,
      };
    }

    const header = 'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                     NAMES';
    const rows = containers.map((c) => {
      const id = c.id.slice(0, 12).padEnd(14);
      const img = (c.image.length > 13 ? c.image.slice(0, 11) + '..' : c.image).padEnd(14);
      const cmd = (`"${c.command}"`.length > 22 ? `"${c.command.slice(0, 20)}..."` : `"${c.command}"`).padEnd(24);
      const created = this.formatTimeAgo(c.created).padEnd(15);
      const status = (c.status === 'running'
        ? 'Up ' + this.formatTimeAgo(c.startedAt || c.created)
        : c.status === 'created'
        ? 'Created'
        : `Exited (${c.exitCode || 0})`).padEnd(14);
      const portStr = c.ports.map((p) => `0.0.0.0:${p.hostPort}->${p.containerPort}/tcp`).join(', ') || '';
      const ports = (portStr.length > 24 ? portStr.slice(0, 22) + '..' : portStr).padEnd(25);
      const name = c.name;

      return `${id} ${img} ${cmd} ${created} ${status} ${ports} ${name}`;
    });

    return {
      stdout: [header, ...rows].join('\n'),
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker stop` (Supports multiple containers)
   */
  private handleStop(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return {
        stdout: '',
        stderr: '"docker stop" requires at least 1 container argument.\nSee \'docker stop --help\'.',
        exitCode: 1,
      };
    }

    const stopped: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return {
          stdout: stopped.join('\n'),
          stderr: `Error response from daemon: No such container: ${target}`,
          exitCode: 1,
        };
      }
      container.status = 'stopped';
      container.finishedAt = Date.now();
      this.recordEvent('container', 'stop', container.id, container.name);
      stopped.push(target);
    }
    this.notify();

    return {
      stdout: stopped.join('\n'),
      stderr: '',
      exitCode: 0,
      explanation: {
        title: `Stopped Container(s): ${stopped.join(', ')}`,
        summary: 'Sent SIGTERM signal to main process, transitioning container state from running to stopped.',
        steps: [
          'Sent SIGTERM (graceful shutdown) to PID 1 inside container.',
          'Processes exited cleanly.',
          'Container state changed to Stopped (filesystem, volumes, and network bindings preserved).',
        ],
        why: 'Stopping a container allows it to be restarted later via `docker start` with all filesystem changes intact.',
      },
    };
  }

  /**
   * `docker start` (Supports multiple containers)
   */
  private handleStart(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return {
        stdout: '',
        stderr: '"docker start" requires at least 1 container argument.\nSee \'docker start --help\'.',
        exitCode: 1,
      };
    }

    const started: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return {
          stdout: started.join('\n'),
          stderr: `Error response from daemon: No such container: ${target}`,
          exitCode: 1,
        };
      }
      container.status = 'running';
      container.startedAt = Date.now();
      this.recordEvent('container', 'start', container.id, container.name);
      started.push(target);
    }
    this.notify();

    return {
      stdout: started.join('\n'),
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker restart`
   */
  private handleRestart(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker restart" requires at least 1 container argument.', exitCode: 1 };
    }

    const restarted: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return { stdout: restarted.join('\n'), stderr: `Error: No such container: ${target}`, exitCode: 1 };
      }
      container.status = 'running';
      container.startedAt = Date.now();
      this.recordEvent('container', 'restart', container.id, container.name);
      restarted.push(target);
    }
    this.notify();
    return { stdout: restarted.join('\n'), stderr: '', exitCode: 0 };
  }

  /**
   * `docker kill`
   */
  private handleKill(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker kill" requires at least 1 container argument.', exitCode: 1 };
    }

    const killed: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return { stdout: killed.join('\n'), stderr: `Error: No such container: ${target}`, exitCode: 1 };
      }
      container.status = 'stopped';
      container.exitCode = 137;
      container.finishedAt = Date.now();
      this.recordEvent('container', 'kill', container.id, container.name, { signal: 'SIGKILL' });
      killed.push(target);
    }
    this.notify();
    return { stdout: killed.join('\n'), stderr: '', exitCode: 0 };
  }

  /**
   * `docker pause`
   */
  private handlePause(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) return { stdout: '', stderr: '"docker pause" requires container argument.', exitCode: 1 };
    for (const target of targets) {
      const c = this.findContainer(target);
      if (c) {
        c.status = 'paused';
        this.recordEvent('container', 'pause', c.id, c.name);
      }
    }
    this.notify();
    return { stdout: targets.join('\n'), stderr: '', exitCode: 0 };
  }

  /**
   * `docker unpause`
   */
  private handleUnpause(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) return { stdout: '', stderr: '"docker unpause" requires container argument.', exitCode: 1 };
    for (const target of targets) {
      const c = this.findContainer(target);
      if (c && c.status === 'paused') {
        c.status = 'running';
        this.recordEvent('container', 'unpause', c.id, c.name);
      }
    }
    this.notify();
    return { stdout: targets.join('\n'), stderr: '', exitCode: 0 };
  }

  /**
   * `docker rm` (Supports -f and multi-container targets. Preserves persistent volumes!)
   */
  private handleRm(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    const force = Boolean(parsed.flags.force || parsed.flags.f);

    if (targets.length === 0) {
      return {
        stdout: '',
        stderr: '"docker rm" requires at least 1 container argument.\nSee \'docker rm --help\'.\n\nUsage:  docker rm [OPTIONS] CONTAINER [CONTAINER...]',
        exitCode: 1,
      };
    }

    const removed: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return {
          stdout: removed.join('\n'),
          stderr: `Error response from daemon: No such container: ${target}`,
          exitCode: 1,
        };
      }

      if (container.status === 'running' && !force) {
        return {
          stdout: removed.join('\n'),
          stderr: `Error response from daemon: You cannot remove a running container ${container.name} (${container.id.slice(0, 12)}). Stop the container before attempting removal or force remove with -f`,
          exitCode: 1,
          explanation: {
            title: `Cannot remove running container: "${container.name}"`,
            summary: 'Docker protects running workloads from accidental deletion.',
            steps: [
              `Stop it first: docker stop ${container.name}`,
              `Then remove: docker rm ${container.name}`,
              `Or force removal directly: docker rm -f ${container.name}`,
            ],
            why: 'Force removal sends SIGKILL to terminate the running processes immediately before unmounting layers.',
          },
        };
      }

      // Detach container from all connected networks
      for (const net of Object.values(this.state.networks)) {
        net.containers = net.containers.filter((cid) => cid !== container.id);
      }

      // Important: Named volumes in this.state.volumes are explicitly NOT deleted!
      // Volumes outlive container lifecycle for data persistence.

      delete this.state.containers[container.id];
      this.recordEvent('container', 'destroy', container.id, container.name);
      removed.push(target);
    }
    this.notify();

    return {
      stdout: removed.join('\n'),
      stderr: '',
      exitCode: 0,
      explanation: {
        title: `Removed Container(s): ${removed.join(', ')}`,
        summary: `Container read-write layer destroyed. Attached named volumes and base images remain intact.`,
        steps: [
          `Detached network endpoints.`,
          `Unmounted storage volumes (persistent named volumes remain safely preserved in Docker).`,
          `Destroyed ephemeral container read-write layer.`,
        ],
        why: 'Containers are disposable. Persistent data must always reside in named volumes so it survives container deletion.',
      },
    };
  }

  /**
   * `docker pull`
   */
  private handlePull(parsed: ParsedCommand): CommandExecutionResult {
    const imageName = parsed.positionalArgs[0];
    if (!imageName) {
      return {
        stdout: '',
        stderr: '"docker pull" requires at least 1 argument.\nSee \'docker pull --help\'.\n\nUsage:  docker pull [OPTIONS] NAME[:TAG|@DIGEST]',
        exitCode: 1,
      };
    }

    const key = imageName.includes(':') ? imageName : `${imageName}:latest`;
    const defaultTemplate = DEFAULT_IMAGES[key] || DEFAULT_IMAGES[`${imageName}:latest`];

    if (defaultTemplate) {
      this.state.images[key] = { ...defaultTemplate };
    } else {
      this.state.images[key] = {
        id: `sha256:${this.generateId(12)}`,
        repository: imageName.split(':')[0],
        tag: imageName.split(':')[1] || 'latest',
        sizeMb: 50 + Math.floor(Math.random() * 100),
        created: Date.now(),
        exposedPorts: [80],
        env: {},
        workdir: '/',
        cmd: ['sh'],
        layers: [{ id: `sha256:${this.generateId(8)}`, instruction: `FROM ${imageName}`, sizeMb: 50, cached: false, command: imageName }],
      };
    }

    const img = this.state.images[key];
    this.recordEvent('image', 'pull', img.id, key);
    this.notify();

    const layerBars = img.layers.map((l, i) => `Layer ${i + 1}/${img.layers.length}: [====================================>] ${l.sizeMb}MB/${l.sizeMb}MB Pull complete`).join('\n');

    return {
      stdout: `Using default tag: ${img.tag}\n${img.tag}: Pulling from library/${img.repository}\n${layerBars}\nDigest: sha256:${this.generateId(32)}\nStatus: Downloaded newer image for ${key}\ndocker.io/library/${key}`,
      stderr: '',
      exitCode: 0,
      affectedResources: [{ type: 'image', id: img.id, action: 'pull' }],
    };
  }

  /**
   * `docker images` / `docker image ls`
   */
  private handleImages(parsed: ParsedCommand): CommandExecutionResult {
    const images = Object.values(this.state.images);
    const quiet = Boolean(parsed.flags.quiet || parsed.flags.q);

    if (quiet) {
      return {
        stdout: images.map((i) => i.id.replace('sha256:', '').slice(0, 12)).join('\n'),
        stderr: '',
        exitCode: 0,
      };
    }

    const header = 'REPOSITORY     TAG       IMAGE ID       CREATED         SIZE';
    const rows = images.map((img) => {
      const repo = img.repository.padEnd(14);
      const tag = img.tag.padEnd(9);
      const id = img.id.replace('sha256:', '').slice(0, 12).padEnd(14);
      const created = this.formatTimeAgo(img.created).padEnd(15);
      const size = `${img.sizeMb}MB`;
      return `${repo} ${tag} ${id} ${created} ${size}`;
    });

    return {
      stdout: [header, ...rows].join('\n'),
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker rmi`
   */
  private handleRmi(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    const force = Boolean(parsed.flags.force || parsed.flags.f);

    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker rmi" requires at least 1 image argument.', exitCode: 1 };
    }

    const unassigned: string[] = [];
    for (const target of targets) {
      const key = target.includes(':') ? target : `${target}:latest`;
      const img = this.state.images[key] || Object.values(this.state.images).find((i) => i.id.includes(target));

      if (!img) {
        return { stdout: unassigned.join('\n'), stderr: `Error response from daemon: No such image: ${target}`, exitCode: 1 };
      }

      // Check if image is used by existing container
      const inUse = Object.values(this.state.containers).find((c) => c.imageId === img.id || c.image === key);
      if (inUse && !force) {
        return {
          stdout: unassigned.join('\n'),
          stderr: `Error response from daemon: conflict: unable to remove repository reference "${target}" (must be forced) - container ${inUse.id.slice(0, 12)} is using its referenced image ${img.id.slice(0, 12)}`,
          exitCode: 1,
        };
      }

      const foundKey = Object.keys(this.state.images).find((k) => this.state.images[k] === img);
      if (foundKey) delete this.state.images[foundKey];
      this.recordEvent('image', 'delete', img.id, foundKey || target);
      unassigned.push(`Untagged: ${foundKey || target}\nDeleted: ${img.id}`);
    }
    this.notify();

    return { stdout: unassigned.join('\n'), stderr: '', exitCode: 0 };
  }

  /**
   * `docker image prune`
   */
  private handleImagePrune(parsed: ParsedCommand): CommandExecutionResult {
    return {
      stdout: `Total reclaimed space: 0B`,
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker volume` (ls, create, inspect, rm, prune)
   */
  private handleVolume(parsed: ParsedCommand): CommandExecutionResult {
    const subcommand = parsed.subcommand || parsed.positionalArgs[0] || 'ls';

    if (subcommand === 'ls') {
      const header = 'DRIVER    VOLUME NAME';
      const rows = Object.values(this.state.volumes).map((v) => `${v.driver.padEnd(9)} ${v.name}`);
      return { stdout: [header, ...rows].join('\n'), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'create') {
      const volName = parsed.positionalArgs[0] || parsed.positionalArgs[1] || `vol_${this.generateId(6)}`;
      if (this.state.volumes[volName]) {
        return { stdout: volName, stderr: '', exitCode: 0 };
      }

      this.state.volumes[volName] = {
        id: `vol-${this.generateId(8)}`,
        name: volName,
        driver: 'local',
        mountpoint: `/var/lib/docker/volumes/${volName}/_data`,
        sizeMb: 0,
        created: Date.now(),
        data: {},
      };
      this.recordEvent('volume', 'create', volName, volName);
      this.notify();

      return {
        stdout: volName,
        stderr: '',
        exitCode: 0,
        explanation: {
          title: `Created Named Volume: "${volName}"`,
          summary: `Provisioned a persistent Docker storage volume decoupled from container lifecycles.`,
          steps: [
            `Allocated host storage at /var/lib/docker/volumes/${volName}/_data.`,
            `Ready to be mounted by any container with -v ${volName}:/path.`,
          ],
          why: `Named volumes persist even when all containers mounting them are stopped or deleted with 'docker rm -f'.`,
        },
      };
    }

    if (subcommand === 'inspect') {
      const volTargets = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      if (volTargets.length === 0) {
        return { stdout: '', stderr: '"docker volume inspect" requires at least 1 volume name argument.', exitCode: 1 };
      }

      const results = [];
      for (const vName of volTargets) {
        const vol = this.state.volumes[vName];
        if (!vol) {
          return { stdout: '', stderr: `Error: No such volume: ${vName}`, exitCode: 1 };
        }
        results.push({
          CreatedAt: new Date(vol.created).toISOString(),
          Driver: vol.driver,
          Labels: vol.labels || null,
          Mountpoint: vol.mountpoint,
          Name: vol.name,
          Options: null,
          Scope: 'local',
        });
      }
      return { stdout: JSON.stringify(results, null, 2), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'rm') {
      const volTargets = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      if (volTargets.length === 0) {
        return { stdout: '', stderr: '"docker volume rm" requires at least 1 volume name.', exitCode: 1 };
      }

      const removed: string[] = [];
      for (const vName of volTargets) {
        if (!this.state.volumes[vName]) {
          return { stdout: removed.join('\n'), stderr: `Error: No such volume: ${vName}`, exitCode: 1 };
        }

        // Check if volume is currently in use
        const inUse = Object.values(this.state.containers).find((c) =>
          c.mounts.some((m) => m.source === vName)
        );
        if (inUse) {
          return {
            stdout: removed.join('\n'),
            stderr: `Error response from daemon: remove ${vName}: volume is in use - [${inUse.id.slice(0, 12)}]`,
            exitCode: 1,
          };
        }

        delete this.state.volumes[vName];
        this.recordEvent('volume', 'delete', vName, vName);
        removed.push(vName);
      }
      this.notify();
      return { stdout: removed.join('\n'), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'prune') {
      const inUseVolumes = new Set<string>();
      Object.values(this.state.containers).forEach((c) => {
        c.mounts.forEach((m) => inUseVolumes.add(m.source));
      });

      const deleted: string[] = [];
      for (const vName of Object.keys(this.state.volumes)) {
        if (!inUseVolumes.has(vName)) {
          delete this.state.volumes[vName];
          deleted.push(vName);
        }
      }
      this.notify();
      return {
        stdout: `Deleted Volumes:\n${deleted.join('\n') || '[none]'}\n\nTotal reclaimed space: 0B`,
        stderr: '',
        exitCode: 0,
      };
    }

    return { stdout: '', stderr: `docker: 'volume ${subcommand}' is not a docker command. See 'docker volume --help'`, exitCode: 1 };
  }

  /**
   * `docker network` (ls, create, inspect, connect, disconnect, rm, prune)
   */
  private handleNetwork(parsed: ParsedCommand): CommandExecutionResult {
    const subcommand = parsed.subcommand || parsed.positionalArgs[0] || 'ls';

    if (subcommand === 'ls') {
      const header = 'NETWORK ID     NAME      DRIVER    SCOPE';
      const rows = Object.values(this.state.networks).map((n) => {
        return `${n.id.slice(0, 12).padEnd(14)} ${n.name.padEnd(9)} ${n.driver.padEnd(9)} local`;
      });
      return { stdout: [header, ...rows].join('\n'), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'create') {
      const netName = parsed.subcommand ? parsed.positionalArgs[0] : parsed.positionalArgs[1];
      if (!netName) {
        return { stdout: '', stderr: '"docker network create" requires network name.\nUsage: docker network create [OPTIONS] NETWORK', exitCode: 1 };
      }
      if (this.state.networks[netName]) {
        return { stdout: '', stderr: `Error response from daemon: network with name ${netName} already exists`, exitCode: 1 };
      }

      const id = this.generateId(12);
      const subnetPrefix = Math.floor(Math.random() * 80 + 20);
      this.state.networks[netName] = {
        id,
        name: netName,
        driver: 'bridge',
        subnet: `172.${subnetPrefix}.0.0/16`,
        gateway: `172.${subnetPrefix}.0.1`,
        internal: false,
        containers: [],
      };
      this.recordEvent('network', 'create', id, netName);
      this.notify();

      return {
        stdout: id,
        stderr: '',
        exitCode: 0,
        explanation: {
          title: `Created User-Defined Network: "${netName}"`,
          summary: `Created an isolated virtual bridge network with automatic embedded DNS service discovery.`,
          steps: [
            `Allocated virtual bridge subnet 172.${subnetPrefix}.0.0/16.`,
            `Enabled automatic container-to-container DNS resolution.`,
          ],
          why: `Containers on custom networks discover each other by container name (e.g. 'http://db:5432') without hardcoding IP addresses.`,
        },
      };
    }

    if (subcommand === 'inspect') {
      const netTargets = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      if (netTargets.length === 0) {
        return { stdout: '', stderr: '"docker network inspect" requires at least 1 network name argument.', exitCode: 1 };
      }

      const results = [];
      for (const nName of netTargets) {
        const net = this.state.networks[nName] || Object.values(this.state.networks).find((n) => n.id.startsWith(nName));
        if (!net) {
          return { stdout: '', stderr: `Error: No such network: ${nName}`, exitCode: 1 };
        }

        const containersMap: Record<string, any> = {};
        for (const cid of net.containers) {
          const c = this.state.containers[cid];
          if (c && c.networks[net.name]) {
            containersMap[cid] = {
              Name: c.name,
              EndpointID: `ep-${this.generateId(8)}`,
              MacAddress: `02:42:ac:14:00:${this.generateId(2)}`,
              IPv4Address: `${c.networks[net.name].ipAddress}/16`,
              IPv6Address: '',
            };
          }
        }

        results.push({
          Name: net.name,
          Id: net.id,
          Created: new Date().toISOString(),
          Scope: 'local',
          Driver: net.driver,
          EnableIPv6: false,
          IPAM: {
            Driver: 'default',
            Options: {},
            Config: [{ Subnet: net.subnet, Gateway: net.gateway }],
          },
          Internal: net.internal,
          Attachable: true,
          Containers: containersMap,
          Options: {},
          Labels: {},
        });
      }
      return { stdout: JSON.stringify(results, null, 2), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'connect') {
      const args = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      const netName = args[0];
      const containerName = args[1];

      if (!netName || !containerName) {
        return { stdout: '', stderr: '"docker network connect" requires network and container arguments.\nUsage: docker network connect [OPTIONS] NETWORK CONTAINER', exitCode: 1 };
      }

      const net = this.state.networks[netName];
      if (!net) return { stdout: '', stderr: `Error response from daemon: network ${netName} not found`, exitCode: 1 };

      const container = this.findContainer(containerName);
      if (!container) return { stdout: '', stderr: `Error response from daemon: No such container: ${containerName}`, exitCode: 1 };

      if (!net.containers.includes(container.id)) {
        net.containers.push(container.id);
        const subnetBase = net.subnet.split('.')[1] || '20';
        container.networks[netName] = {
          ipAddress: `172.${subnetBase}.0.${this.ipCounter++}`,
          gateway: net.gateway,
          aliases: [container.name],
        };
        this.recordEvent('network', 'connect', net.id, netName, { container: container.name });
        this.notify();
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (subcommand === 'disconnect') {
      const args = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      const netName = args[0];
      const containerName = args[1];

      if (!netName || !containerName) {
        return { stdout: '', stderr: '"docker network disconnect" requires network and container arguments.', exitCode: 1 };
      }

      const net = this.state.networks[netName];
      const container = this.findContainer(containerName);
      if (!net || !container) return { stdout: '', stderr: `Error: Network or container not found.`, exitCode: 1 };

      net.containers = net.containers.filter((id) => id !== container.id);
      delete container.networks[netName];
      this.recordEvent('network', 'disconnect', net.id, netName, { container: container.name });
      this.notify();
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (subcommand === 'rm') {
      const netTargets = parsed.subcommand ? parsed.positionalArgs : parsed.positionalArgs.slice(1);
      if (netTargets.length === 0) return { stdout: '', stderr: '"docker network rm" requires network name.', exitCode: 1 };

      const removed: string[] = [];
      for (const nName of netTargets) {
        if (['bridge', 'host', 'none'].includes(nName)) {
          return { stdout: removed.join('\n'), stderr: `Error response from daemon: '${nName}' is a predefined network and cannot be removed`, exitCode: 1 };
        }
        const net = this.state.networks[nName];
        if (!net) return { stdout: removed.join('\n'), stderr: `Error: No such network: ${nName}`, exitCode: 1 };

        if (net.containers.length > 0) {
          return { stdout: removed.join('\n'), stderr: `Error response from daemon: network ${nName} has active endpoints`, exitCode: 1 };
        }
        delete this.state.networks[nName];
        this.recordEvent('network', 'delete', net.id, nName);
        removed.push(nName);
      }
      this.notify();
      return { stdout: removed.join('\n'), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'prune') {
      const deleted: string[] = [];
      for (const [name, net] of Object.entries(this.state.networks)) {
        if (!['bridge', 'host', 'none'].includes(name) && net.containers.length === 0) {
          delete this.state.networks[name];
          deleted.push(name);
        }
      }
      this.notify();
      return { stdout: `Deleted Networks:\n${deleted.join('\n') || '[none]'}`, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `docker: 'network ${subcommand}' is not a docker command. See 'docker network --help'`, exitCode: 1 };
  }

  /**
   * `docker inspect` (Live state reflecting actual environment)
   */
  private handleInspect(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker inspect" requires at least 1 object name or ID.', exitCode: 1 };
    }

    const results = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (container) {
        results.push({
          Id: container.id,
          Created: new Date(container.created).toISOString(),
          Path: container.command.split(' ')[0],
          Args: container.command.split(' ').slice(1),
          State: {
            Status: container.status,
            Running: container.status === 'running',
            Paused: container.status === 'paused',
            Restarting: container.status === 'restarting',
            Dead: false,
            Pid: container.status === 'running' ? 1234 : 0,
            ExitCode: container.exitCode || 0,
            StartedAt: container.startedAt ? new Date(container.startedAt).toISOString() : '',
            FinishedAt: container.finishedAt ? new Date(container.finishedAt).toISOString() : '',
          },
          Image: container.imageId,
          Name: `/${container.name}`,
          RestartPolicy: { Name: container.restartPolicy, MaximumRetryCount: 0 },
          HostConfig: {
            NetworkMode: Object.keys(container.networks)[0] || 'bridge',
            PortBindings: container.ports.reduce((acc, p) => {
              acc[`${p.containerPort}/tcp`] = [{ HostIp: '0.0.0.0', HostPort: String(p.hostPort) }];
              return acc;
            }, {} as Record<string, any>),
          },
          NetworkSettings: {
            IPAddress: Object.values(container.networks)[0]?.ipAddress || '',
            Gateway: Object.values(container.networks)[0]?.gateway || '',
            Ports: container.ports.reduce((acc, p) => {
              acc[`${p.containerPort}/tcp`] = [{ HostIp: '0.0.0.0', HostPort: String(p.hostPort) }];
              return acc;
            }, {} as Record<string, any>),
            Networks: container.networks,
          },
          Mounts: container.mounts.map((m) => ({
            Type: m.type,
            Name: m.type === 'volume' ? m.source : undefined,
            Source: m.type === 'volume' ? `/var/lib/docker/volumes/${m.source}/_data` : m.source,
            Destination: m.destination,
            Mode: m.readonly ? 'ro' : 'rw',
            RW: !m.readonly,
          })),
          Config: {
            Hostname: container.name,
            Env: Object.entries(container.environment).map(([k, v]) => `${k}=${v}`),
            Cmd: container.command.split(' '),
            Image: container.image,
          },
        });
        continue;
      }

      const img = this.state.images[target] || Object.values(this.state.images).find((i) => i.id.includes(target));
      if (img) {
        results.push(img);
        continue;
      }

      const net = this.state.networks[target] || Object.values(this.state.networks).find((n) => n.id === target);
      if (net) {
        results.push(net);
        continue;
      }

      const vol = this.state.volumes[target];
      if (vol) {
        results.push(vol);
        continue;
      }

      return { stdout: '', stderr: `Error: No such object: ${target}`, exitCode: 1 };
    }

    return { stdout: JSON.stringify(results, null, 2), stderr: '', exitCode: 0 };
  }

  /**
   * `docker logs`
   */
  private handleLogs(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    if (!target) {
      return { stdout: '', stderr: '"docker logs" requires 1 container argument.', exitCode: 1 };
    }

    const container = this.findContainer(target);
    if (!container) {
      return { stdout: '', stderr: `Error response from daemon: No such container: ${target}`, exitCode: 1 };
    }

    const tailCount = parsed.flags.tail ? parseInt(parsed.flags.tail, 10) : undefined;
    const logs = tailCount ? container.logs.slice(-tailCount) : container.logs;

    return {
      stdout: logs.map((l) => `${l.timestamp} [${l.stream}] ${l.message}`).join('\n') || '[empty log stream]',
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker exec` (Interactive container shell and DNS testing)
   */
  private handleExec(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    const execCmd = parsed.positionalArgs.slice(1).join(' ');

    if (!target || !execCmd) {
      return {
        stdout: '',
        stderr: '"docker exec" requires at least 2 arguments: container and command.\nExample: docker exec -it db sh',
        exitCode: 1,
      };
    }

    const container = this.findContainer(target);
    if (!container) {
      return { stdout: '', stderr: `Error response from daemon: No such container: ${target}`, exitCode: 1 };
    }

    if (container.status !== 'running') {
      return {
        stdout: '',
        stderr: `Error response from daemon: Container ${container.name} (${container.id.slice(0, 12)}) is not running`,
        exitCode: 1,
      };
    }

    // Shell entry
    if (['sh', 'bash', '/bin/sh', '/bin/bash'].includes(execCmd)) {
      return {
        stdout: `Inside container: ${container.name} (${container.id.slice(0, 8)})\n# Connected to simulated shell. Commands supported: ls, pwd, env, cat, whoami, ping, curl`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (execCmd === 'pwd') {
      return { stdout: '/app', stderr: '', exitCode: 0 };
    }

    if (execCmd === 'whoami') {
      return { stdout: 'root', stderr: '', exitCode: 0 };
    }

    if (execCmd === 'ls' || execCmd.startsWith('ls ')) {
      return {
        stdout: 'bin   dev   etc   home  lib   media mnt   opt   proc  root  run   sbin  srv   sys   tmp   usr   var   app',
        stderr: '',
        exitCode: 0,
      };
    }

    if (execCmd === 'env' || execCmd === 'printenv') {
      const envLines = Object.entries(container.environment).map(([k, v]) => `${k}=${v}`);
      return {
        stdout: envLines.join('\n') || `HOSTNAME=${container.name}\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        stderr: '',
        exitCode: 0,
      };
    }

    // Network & Embedded DNS resolution simulation (e.g. `ping db` or `curl order-api:5000`)
    if (execCmd.startsWith('ping ') || execCmd.startsWith('curl ')) {
      const isCurl = execCmd.startsWith('curl');
      const hostTarget = execCmd.replace(/^(ping|curl)\s+(-[a-zA-Z]+\s+)?/, '').replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

      if (hostTarget === 'localhost' || hostTarget === '127.0.0.1') {
        if (isCurl) {
          return {
            stdout: `HTTP/1.1 200 OK\nServer: ${container.image}\nContent-Type: text/html\n\n<!DOCTYPE html><html><body>Welcome to ${container.name}!</body></html>`,
            stderr: '',
            exitCode: 0,
          };
        }
        return {
          stdout: `PING localhost (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=64 time=0.041 ms\n--- localhost ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss`,
          stderr: '',
          exitCode: 0,
        };
      }

      // Find target container by name or alias or IP
      const targetContainer = Object.values(this.state.containers).find(
        (c) =>
          c.status === 'running' &&
          (c.name === hostTarget ||
            c.id.startsWith(hostTarget) ||
            Object.values(c.networks).some(
              (n) => n.aliases.includes(hostTarget) || n.ipAddress === hostTarget
            ))
      );

      if (!targetContainer) {
        return {
          stdout: '',
          stderr: `${isCurl ? 'curl: (6) Could not resolve host:' : 'ping: bad address'} '${hostTarget}'\n\nHint: Container '${hostTarget}' is not running or does not exist.`,
          exitCode: 6,
        };
      }

      // Check all shared networks between source container and target container
      const sourceNets = Object.keys(container.networks);
      const targetNets = Object.keys(targetContainer.networks);
      const sharedNets = sourceNets.filter((net) => targetNets.includes(net));

      if (sharedNets.length === 0) {
        return {
          stdout: '',
          stderr: `${isCurl ? 'curl: (7) Failed to connect to host' : 'ping: Destination Host Unreachable'}: '${hostTarget}'\n\n💡 Network Isolation:\nContainer '${container.name}' and '${targetContainer.name}' are on separate, isolated networks and cannot communicate.\nAttach them to the same network:\n  docker network connect <network-name> ${container.name}\n  docker network connect <network-name> ${targetContainer.name}`,
          exitCode: 1,
        };
      }

      // Look for any user-defined network (non-default bridge)
      const userDefinedSharedNet = sharedNets.find((net) => net !== 'bridge');

      if (userDefinedSharedNet) {
        // SUCCESS: Container name DNS resolution succeeds on user-defined bridge network!
        const targetIp = targetContainer.networks[userDefinedSharedNet]?.ipAddress || '172.20.0.3';
        if (isCurl) {
          return {
            stdout: `HTTP/1.1 200 OK\nServer: ${targetContainer.image}\nContent-Type: application/json\n\n{"status":"ok","service":"${targetContainer.name}","ip":"${targetIp}","network":"${userDefinedSharedNet}"}`,
            stderr: '',
            exitCode: 0,
          };
        }
        return {
          stdout: `PING ${hostTarget} (${targetIp}): 56 data bytes\n64 bytes from ${hostTarget} (${targetIp}): seq=0 ttl=64 time=0.215 ms\n64 bytes from ${hostTarget} (${targetIp}): seq=1 ttl=64 time=0.198 ms\n--- ${hostTarget} ping statistics ---\n2 packets transmitted, 2 packets received, 0% packet loss`,
          stderr: '',
          exitCode: 0,
        };
      }

      // If the ONLY shared network is the default 'bridge' network, container name DNS fails by Docker design
      if (sharedNets.includes('bridge')) {
        // If user pinged by IP address directly, it succeeds on default bridge
        const targetIp = targetContainer.networks['bridge']?.ipAddress;
        if (hostTarget === targetIp) {
          return {
            stdout: `PING ${hostTarget} (${targetIp}): 56 data bytes\n64 bytes from ${hostTarget} (${targetIp}): seq=0 ttl=64 time=0.280 ms\n--- ${hostTarget} ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss`,
            stderr: '',
            exitCode: 0,
          };
        }

        return {
          stdout: '',
          stderr: `${isCurl ? 'curl: (6) Could not resolve host:' : 'ping: bad address'} '${hostTarget}'\n\n💡 Docker Explanation:\nContainers on the default 'bridge' network cannot resolve each other by container name.\nTo enable automatic DNS service discovery, create and attach them to a user-defined network:\n  docker network create app-net\n  docker network connect app-net ${container.name}\n  docker network connect app-net ${targetContainer.name}`,
          exitCode: 6,
        };
      }

      return {
        stdout: '',
        stderr: `${isCurl ? 'curl: (6) Could not resolve host:' : 'ping: bad address'} '${hostTarget}'`,
        exitCode: 6,
      };
    }

    return {
      stdout: `[${container.name}] Executed '${execCmd}' successfully.`,
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker stats`
   */
  private handleStats(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    const containers = target
      ? [this.findContainer(target)].filter(Boolean) as Container[]
      : Object.values(this.state.containers).filter((c) => c.status === 'running');

    const header = 'CONTAINER ID   NAME       CPU %     MEM USAGE / LIMIT     MEM %     NET I/O          PIDS';
    const rows = containers.map((c) => {
      const id = c.id.slice(0, 12).padEnd(14);
      const name = c.name.padEnd(10);
      const cpu = `${c.resources.cpuPercent}%`.padEnd(9);
      const limit = c.resources.memoryLimitMb ? `${c.resources.memoryLimitMb}MiB` : '1.95GiB';
      const mem = `${c.resources.memoryUsageMb}MiB / ${limit}`.padEnd(21);
      const memPct = `${((c.resources.memoryUsageMb / 1024) * 100).toFixed(1)}%`.padEnd(9);
      const netIo = `${c.resources.networkRxKb}kB / ${c.resources.networkTxKb}kB`.padEnd(16);
      const pids = `${c.resources.processCount}`;
      return `${id} ${name} ${cpu} ${mem} ${memPct} ${netIo} ${pids}`;
    });

    return {
      stdout: [header, ...rows].join('\n'),
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker top`
   */
  private handleTop(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    if (!target) return { stdout: '', stderr: '"docker top" requires 1 container argument.', exitCode: 1 };
    const container = this.findContainer(target);
    if (!container) return { stdout: '', stderr: `Error: No such container: ${target}`, exitCode: 1 };

    return {
      stdout: `UID        PID   PPID  C STIME TTY          TIME CMD\nroot       1     0     0 12:00 ?        00:00:01 ${container.command}\nroot       18    1     0 12:00 ?        00:00:00 ${container.command} (worker)`,
      stderr: '',
      exitCode: 0,
    };
  }

  /**
   * `docker build`
   */
  private handleBuild(parsed: ParsedCommand): CommandExecutionResult {
    const tag = parsed.flags.tag || parsed.flags.t || 'custom-app:latest';
    const tagFull = tag.includes(':') ? tag : `${tag}:latest`;
    const repo = tagFull.split(':')[0];
    const version = tagFull.split(':')[1];

    const newImg: DockerImage = {
      id: `sha256:${this.generateId(12)}`,
      repository: repo,
      tag: version,
      sizeMb: 124,
      created: Date.now(),
      exposedPorts: [3000],
      env: { NODE_ENV: 'production' },
      workdir: '/app',
      cmd: ['npm', 'start'],
      layers: [
        { id: `sha256:${this.generateId(8)}`, instruction: 'FROM node:22-alpine', sizeMb: 78, cached: true, command: 'FROM node:22-alpine' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'WORKDIR /app', sizeMb: 0.1, cached: true, command: 'WORKDIR /app' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'COPY package*.json ./', sizeMb: 0.2, cached: true, command: 'COPY package*.json ./' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'RUN npm install', sizeMb: 42, cached: false, command: 'RUN npm install' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'COPY . .', sizeMb: 3.7, cached: false, command: 'COPY . .' },
      ],
    };

    this.state.images[tagFull] = newImg;
    this.recordEvent('image', 'build', newImg.id, tagFull);
    this.notify();

    return {
      stdout: `[+] Building 2.4s (7/7) FINISHED\n => [internal] load build definition from Dockerfile\n => [1/5] FROM docker.io/library/node:22-alpine\n => [2/5] WORKDIR /app\n => [3/5] COPY package*.json ./\n => [4/5] RUN npm install\n => [5/5] COPY . .\n => exporting to image\n => => naming to docker.io/library/${tagFull}\nSuccessfully built ${newImg.id.slice(0, 12)}\nSuccessfully tagged ${tagFull}`,
      stderr: '',
      exitCode: 0,
      explanation: {
        title: `Built Image "${tagFull}"`,
        summary: `Executed Dockerfile instructions layer-by-layer to assemble a new immutable image.`,
        steps: [
          'Evaluated layer cache for unmodified instructions.',
          'Created intermediate read-write build container layers.',
          'Committed final image filesystem.',
        ],
        why: 'Docker layer caching accelerates builds by reusing previous step hashes.',
      },
    };
  }

  /**
   * `docker tag`
   */
  private handleTag(parsed: ParsedCommand): CommandExecutionResult {
    const src = parsed.positionalArgs[0];
    const tgt = parsed.positionalArgs[1];
    if (!src || !tgt) return { stdout: '', stderr: '"docker tag" requires source and target images.', exitCode: 1 };

    const srcKey = src.includes(':') ? src : `${src}:latest`;
    const tgtKey = tgt.includes(':') ? tgt : `${tgt}:latest`;
    const img = this.state.images[srcKey];

    if (!img) return { stdout: '', stderr: `Error: No such image: ${src}`, exitCode: 1 };

    this.state.images[tgtKey] = { ...img, repository: tgtKey.split(':')[0], tag: tgtKey.split(':')[1] };
    this.notify();
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  /**
   * `docker compose`
   */
  private handleComposeCommand(parsed: ParsedCommand): CommandExecutionResult {
    const cmd = parsed.command || 'ps';

    if (cmd === 'up') {
      const projectName = 'dockerplay';
      const netName = `${projectName}_default`;

      if (!this.state.networks[netName]) {
        this.state.networks[netName] = {
          id: `net-${this.generateId(8)}`,
          name: netName,
          driver: 'bridge',
          subnet: '172.24.0.0/16',
          gateway: '172.24.0.1',
          internal: false,
          containers: [],
        };
      }

      // Auto provision dbdata volume for compose database service
      if (!this.state.volumes['dbdata']) {
        this.state.volumes['dbdata'] = {
          id: `vol-${this.generateId(8)}`,
          name: 'dbdata',
          driver: 'local',
          mountpoint: '/var/lib/docker/volumes/dbdata/_data',
          sizeMb: 0,
          created: Date.now(),
          data: {},
        };
      }

      const services = [
        { name: `${projectName}-frontend-1`, img: 'nginx:alpine', hostPort: 3000, containerPort: 80, mounts: [] },
        { name: `${projectName}-backend-1`, img: 'node:22-alpine', hostPort: 5000, containerPort: 5000, mounts: [] },
        {
          name: `${projectName}-database-1`,
          img: 'postgres:16-alpine',
          hostPort: 5432,
          containerPort: 5432,
          mounts: [{ source: 'dbdata', destination: '/var/lib/postgresql/data', type: 'volume' as const, readonly: false }],
        },
      ];

      for (const s of services) {
        const id = this.generateId(12);
        this.state.containers[id] = {
          id,
          name: s.name,
          image: s.img,
          imageId: `sha256:${this.generateId(12)}`,
          status: 'running',
          health: 'healthy',
          command: 'entrypoint.sh',
          created: Date.now(),
          startedAt: Date.now(),
          ports: [{ hostPort: s.hostPort, containerPort: s.containerPort, protocol: 'tcp' }],
          environment: { PROJECT: projectName, SERVICE: s.name, POSTGRES_PASSWORD: 'secretpassword' },
          networks: {
            [netName]: { ipAddress: `172.24.0.${this.ipCounter++}`, gateway: '172.24.0.1', aliases: [s.name, s.name.split('-')[1]] },
          },
          mounts: s.mounts,
          labels: { 'com.docker.compose.project': projectName },
          logs: [{ timestamp: new Date().toISOString(), stream: 'stdout', message: `${s.name} ready and listening` }],
          resources: { memoryUsageMb: 45, cpuPercent: 0.5, networkRxKb: 50, networkTxKb: 30, processCount: 2 },
          restartPolicy: 'always',
        };
        this.state.networks[netName].containers.push(id);
      }

      this.notify();
      return {
        stdout: `[+] Running 4/4\n ✔ Network ${netName}    Created\n ✔ Container ${projectName}-database-1  Started\n ✔ Container ${projectName}-backend-1   Started\n ✔ Container ${projectName}-frontend-1  Started`,
        stderr: '',
        exitCode: 0,
        explanation: {
          title: 'Docker Compose Project Started',
          summary: `Orchestrated 3 interconnected microservices (frontend, backend, database) on unified network "${netName}".`,
          steps: [
            `Created project network "${netName}".`,
            `Mounted persistent volume "dbdata" to database.`,
            `Started backend API and frontend reverse proxy with automatic embedded DNS discovery.`,
          ],
          why: 'Docker Compose enables multi-container orchestration from declarative YAML configurations.',
        },
      };
    }

    if (cmd === 'down') {
      const composeContainers = Object.values(this.state.containers).filter((c) => c.labels['com.docker.compose.project']);
      for (const c of composeContainers) {
        delete this.state.containers[c.id];
      }
      this.notify();
      return {
        stdout: `[+] Running 3/3\n ✔ Container dockerplay-frontend-1  Removed\n ✔ Container dockerplay-backend-1   Removed\n ✔ Container dockerplay-database-1  Removed`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (cmd === 'ps') {
      const composeContainers = Object.values(this.state.containers).filter((c) => c.labels['com.docker.compose.project']);
      if (composeContainers.length === 0) {
        return { stdout: 'NAME                     IMAGE             COMMAND          SERVICE     STATUS    PORTS', stderr: '', exitCode: 0 };
      }
      let out = 'NAME                     IMAGE             COMMAND          SERVICE     STATUS              PORTS\n';
      for (const c of composeContainers) {
        const portsStr = c.ports.map((p) => `0.0.0.0:${p.hostPort}->${p.containerPort}/tcp`).join(', ');
        const svc = c.name.split('-')[1] || c.name;
        out += `${c.name.padEnd(25)}${c.image.padEnd(18)}${c.command.padEnd(17)}${svc.padEnd(12)}${'Up (healthy)'.padEnd(20)}${portsStr}\n`;
      }
      return { stdout: out.trimEnd(), stderr: '', exitCode: 0 };
    }

    if (cmd === 'logs') {
      const composeContainers = Object.values(this.state.containers).filter((c) => c.labels['com.docker.compose.project']);
      if (composeContainers.length === 0) {
        return { stdout: 'No compose services running. Run "docker compose up -d" to start.', stderr: '', exitCode: 0 };
      }
      let out = '';
      for (const c of composeContainers) {
        const svc = c.name.split('-')[1] || c.name;
        out += `${svc.padEnd(10)} | Service ${svc} ready and accepting connections\n`;
      }
      return { stdout: out.trimEnd(), stderr: '', exitCode: 0 };
    }

    if (cmd === 'restart') {
      const composeContainers = Object.values(this.state.containers).filter((c) => c.labels['com.docker.compose.project']);
      for (const c of composeContainers) {
        c.startedAt = Date.now();
        c.status = 'running';
      }
      this.notify();
      return {
        stdout: `[+] Restarting 3/3\n ✔ Container dockerplay-frontend-1  Restarted\n ✔ Container dockerplay-backend-1   Restarted\n ✔ Container dockerplay-database-1  Restarted`,
        stderr: '',
        exitCode: 0,
      };
    }

    return {
      stdout: `
Usage:  docker compose [COMMAND]

Define and run multi-container applications with Docker.

Commands:
  build       Build or rebuild services
  down        Stop and remove containers, networks
  logs        View output from containers
  ps          List containers
  restart     Restart service containers
  up          Create and start containers
`,
      stderr: '',
      exitCode: 0,
    };
  }

  private handleHelp(): CommandExecutionResult {
    return {
      stdout: `
Usage:  docker [OPTIONS] COMMAND

A self-contained simulated Docker environment for hands-on learning.

Management Commands:
  container   Manage containers
  image       Manage images
  network     Manage networks
  volume      Manage volumes
  compose     Docker Compose orchestration

Commands:
  run         Create and run a new container from an image
  create      Create a new container without starting it
  exec        Execute a command in a running container
  ps          List containers
  build       Build an image from a Dockerfile
  pull        Download an image from a registry
  images      List images
  logs        Fetch the logs of a container
  stop        Stop one or more running containers
  start       Start one or more stopped containers
  restart     Restart one or more containers
  kill        Kill one or more running containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  inspect     Return low-level information on Docker objects
  stats       Display a live stream of container resource usage statistics
  top         Display the running processes of a container

Run 'docker COMMAND --help' for more information on a command.
      `.trim(),
      stderr: '',
      exitCode: 0,
    };
  }

  // =================== UTILITY METHODS ===================

  public findContainer(nameOrId: string): Container | undefined {
    return (
      this.state.containers[nameOrId] ||
      Object.values(this.state.containers).find(
        (c) =>
          c.name === nameOrId ||
          c.id.startsWith(nameOrId) ||
          c.name === nameOrId.replace('/', '')
      )
    );
  }

  private formatTimeAgo(timestamp: number): string {
    const diff = Math.max(0, Date.now() - timestamp);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs} seconds ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    return `${hours} hours ago`;
  }

  private generateMockLogs(repo: string, name: string, ports: PortMapping[]): Container['logs'] {
    const time = new Date().toISOString();
    if (repo.includes('nginx')) {
      return [
        { timestamp: time, stream: 'stdout', message: `/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration` },
        { timestamp: time, stream: 'stdout', message: `10-listen-on-ipv6-by-default.sh: Getting IPv6 support...` },
        { timestamp: time, stream: 'stdout', message: `Configuration complete; ready for start up` },
        { timestamp: time, stream: 'stdout', message: `nginx/1.27.0 started in master process (PID 1)` },
        { timestamp: time, stream: 'stdout', message: `ready for connections (port 80)` },
      ];
    }
    if (repo.includes('postgres')) {
      return [
        { timestamp: time, stream: 'stdout', message: `PostgreSQL Database directory appears to contain a database; Skipping initialization` },
        { timestamp: time, stream: 'stdout', message: `LOG: starting PostgreSQL 16.2 on x86_64-pc-linux-musl` },
        { timestamp: time, stream: 'stdout', message: `LOG: listening on IPv4 address "0.0.0.0", port 5432` },
        { timestamp: time, stream: 'stdout', message: `LOG: database system is ready to accept connections` },
      ];
    }
    if (repo.includes('redis')) {
      return [
        { timestamp: time, stream: 'stdout', message: `1:M Running mode=standalone, port=6379.` },
        { timestamp: time, stream: 'stdout', message: `1:M Server initialized` },
        { timestamp: time, stream: 'stdout', message: `1:M Ready to accept connections tcp` },
      ];
    }
    return [
      { timestamp: time, stream: 'stdout', message: `Container ${name} initialized with PID 1` },
      { timestamp: time, stream: 'stdout', message: `Application listening on internal port ${ports[0]?.containerPort || 3000}` },
      { timestamp: time, stream: 'stdout', message: `Ready to serve traffic.` },
    ];
  }
}

// Global Singleton Instance
let globalDockerEngineInstance: DockerEngine | null = null;

export function getDockerEngine(): DockerEngine {
  if (!globalDockerEngineInstance) {
    globalDockerEngineInstance = new DockerEngine();
  }
  return globalDockerEngineInstance;
}
