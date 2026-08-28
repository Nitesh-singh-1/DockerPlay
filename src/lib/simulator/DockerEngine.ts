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

export type StateListener = (state: DockerState) => void;

export class DockerEngine {
  private state: DockerState;
  private listeners: Set<StateListener> = new Set();
  private ipCounter: number = 2;

  constructor(initialState?: DockerState) {
    this.state = initialState ? JSON.parse(JSON.stringify(initialState)) : createInitialDockerState();
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
    this.state = presetState ? JSON.parse(JSON.stringify(presetState)) : createInitialDockerState();
    this.recordEvent('daemon', 'reset', 'docker-daemon', 'dockerd', { reason: 'user_reset' });
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
    if (!parsed.isValid) {
      return {
        stdout: '',
        stderr: parsed.validationError || 'Invalid command syntax.',
        exitCode: 1,
      };
    }

    if (parsed.binary === 'docker-compose') {
      return this.handleComposeCommand(parsed);
    }

    switch (parsed.command) {
      case 'run':
        return this.handleRun(parsed);
      case 'ps':
        return this.handlePs(parsed);
      case 'images':
      case 'image':
        if (parsed.subcommand === 'ls' || !parsed.subcommand) {
          return this.handleImages(parsed);
        } else if (parsed.subcommand === 'rm') {
          return this.handleRmi(parsed);
        } else if (parsed.subcommand === 'inspect') {
          return this.handleInspect(parsed);
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

  private handleRun(parsed: ParsedCommand): CommandExecutionResult {
    const imageName = parsed.positionalArgs[0];
    if (!imageName) {
      return {
        stdout: '',
        stderr: '"docker run" requires at least 1 argument (the image name).\nSee \'docker run --help\'.',
        exitCode: 1,
      };
    }

    // Resolve Image
    let imageKey = imageName.includes(':') ? imageName : `${imageName}:latest`;
    let image = this.state.images[imageKey];
    let pullLogs = '';

    if (!image) {
      if (DEFAULT_IMAGES[imageKey] || DEFAULT_IMAGES[`${imageName}:latest`]) {
        const foundKey = DEFAULT_IMAGES[imageKey] ? imageKey : `${imageName}:latest`;
        this.state.images[foundKey] = { ...DEFAULT_IMAGES[foundKey] };
        image = this.state.images[foundKey];
        imageKey = foundKey;
        pullLogs = `Unable to find image '${imageName}' locally\nlatest: Pulling from library/${imageName}\nDigest: sha256:5b8e91... \nStatus: Downloaded newer image for ${imageKey}\n`;
        this.recordEvent('image', 'pull', image.id, imageKey);
      } else {
        // Create auto simulated base image
        const newImg: DockerImage = {
          id: `sha256:${this.generateId(12)}`,
          repository: imageName.split(':')[0],
          tag: imageName.split(':')[1] || 'latest',
          sizeMb: 64,
          created: Date.now(),
          exposedPorts: [80],
          env: {},
          workdir: '/app',
          cmd: ['sh'],
          layers: [{ id: `sha256:${this.generateId(8)}`, instruction: `FROM ${imageName}`, sizeMb: 64, cached: false, command: imageName }],
        };
        this.state.images[imageKey] = newImg;
        image = newImg;
        pullLogs = `Unable to find image '${imageName}' locally\nPulling from library/${imageName}...\nStatus: Downloaded newer image for ${imageKey}\n`;
      }
    }

    // Name container
    const containerName = parsed.flags.name || `${image.repository}-${this.generateId(4)}`;
    if (Object.values(this.state.containers).some((c) => c.name === containerName)) {
      return {
        stdout: '',
        stderr: `docker: Error response from daemon: Conflict. The container name "/${containerName}" is already in use. You have to remove (or rename) that container to be able to reuse that name.`,
        exitCode: 1,
      };
    }

    // Parse Ports
    const ports: PortMapping[] = [];
    const portFlags = Array.isArray(parsed.flags.publish) ? parsed.flags.publish : parsed.flags.publish ? [parsed.flags.publish] : [];

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

        // Check for host port conflicts among running containers
        for (const c of Object.values(this.state.containers)) {
          if (c.status === 'running') {
            const conflict = c.ports.find((pm) => pm.hostPort === hostPort);
            if (conflict) {
              return {
                stdout: '',
                stderr: `docker: Error response from daemon: driver failed programming external connectivity on endpoint ${containerName}: Bind for 0.0.0.0:${hostPort} failed: port is already allocated.`,
                exitCode: 1,
              };
            }
          }
        }

        ports.push({ hostPort, containerPort, protocol: 'tcp' });
      }
    }

    // Parse Networks
    const networkName = parsed.flags.network || 'bridge';
    const targetNetwork = this.state.networks[networkName];
    if (!targetNetwork) {
      return {
        stdout: '',
        stderr: `docker: Error response from daemon: network ${networkName} not found. Hint: create it first with 'docker network create ${networkName}'`,
        exitCode: 1,
      };
    }

    const containerId = this.generateId(12);
    const assignedIp = `172.18.0.${this.ipCounter++}`;

    // Parse Environment Variables
    const env: Record<string, string> = { ...image.env };
    const envFlags = Array.isArray(parsed.flags.env) ? parsed.flags.env : parsed.flags.env ? [parsed.flags.env] : [];
    for (const e of envFlags) {
      const [k, v] = String(e).split('=');
      if (k) env[k] = v || '';
    }

    // Parse Volumes
    const mounts: VolumeMount[] = [];
    const volFlags = Array.isArray(parsed.flags.volume) ? parsed.flags.volume : parsed.flags.volume ? [parsed.flags.volume] : [];
    for (const v of volFlags) {
      const parts = String(v).split(':');
      if (parts.length >= 2) {
        const source = parts[0];
        const dest = parts[1];
        const isBind = source.startsWith('.') || source.startsWith('/') || source.includes('\\');
        if (!isBind && !this.state.volumes[source]) {
          // Auto create named volume if it doesn't exist
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

    const isDetached = Boolean(parsed.flags.detach);
    const cmdArgs = parsed.positionalArgs.slice(1);
    const finalCmd = cmdArgs.length > 0 ? cmdArgs.join(' ') : image.cmd.join(' ');

    // Generate initial logs based on image
    const logs = this.generateMockLogs(image.repository, containerName, ports);

    // Create container object
    const newContainer: Container = {
      id: containerId,
      name: containerName,
      image: imageKey,
      imageId: image.id,
      status: 'running',
      health: 'healthy',
      command: finalCmd,
      created: Date.now(),
      startedAt: Date.now(),
      ports,
      environment: env,
      networks: {
        [networkName]: {
          ipAddress: assignedIp,
          gateway: targetNetwork.gateway || '172.18.0.1',
          aliases: [containerName],
        },
      },
      mounts,
      labels: {},
      logs,
      resources: {
        memoryUsageMb: Math.floor(Math.random() * 40 + 20),
        cpuPercent: parseFloat((Math.random() * 2 + 0.1).toFixed(1)),
        networkRxKb: 142,
        networkTxKb: 89,
        processCount: 2,
        memoryLimitMb: parsed.flags.memory ? parseInt(parsed.flags.memory, 10) : undefined,
      },
      restartPolicy: parsed.flags.restart || 'no',
    };

    // Attach to state & network
    this.state.containers[containerId] = newContainer;
    targetNetwork.containers.push(containerId);

    this.recordEvent('container', 'create', containerId, containerName, { image: imageKey });
    this.recordEvent('container', 'start', containerId, containerName, { image: imageKey });
    this.notify();

    // Educational Breakdown Data
    const beginnerBreakdown = [
      { token: 'docker', role: 'Command', description: 'Calls the Docker CLI tool' },
      { token: 'run', role: 'Action', description: 'Creates a new container layer and starts execution' },
    ];
    if (isDetached) {
      beginnerBreakdown.push({ token: '-d', role: 'Flag', description: 'Runs container in detached (background) mode' });
    }
    if (parsed.flags.name) {
      beginnerBreakdown.push({ token: `--name ${parsed.flags.name}`, role: 'Flag', description: `Assigns custom friendly name '${parsed.flags.name}'` });
    }
    if (ports.length > 0) {
      beginnerBreakdown.push({
        token: `-p ${ports[0].hostPort}:${ports[0].containerPort}`,
        role: 'Flag',
        description: `Maps host port ${ports[0].hostPort} -> container port ${ports[0].containerPort}`,
      });
    }
    beginnerBreakdown.push({ token: imageKey, role: 'Argument', description: `The base image blueprint to run` });

    const portSummary = ports.length > 0 ? ` mapped to host port ${ports.map((p) => `${p.hostPort}:${p.containerPort}`).join(', ')}` : ' (no host ports published)';

    return {
      stdout: `${pullLogs}${isDetached ? containerId : `[${containerName}] Container started in foreground.\nLogs:\n` + logs.map((l) => l.message).join('\n')}`,
      stderr: '',
      exitCode: 0,
      explanation: {
        title: `Container "${containerName}" successfully created & started!`,
        summary: `Docker initialized a fresh container from "${imageKey}" on network "${networkName}"${portSummary}.`,
        steps: [
          `Found local image blueprint "${imageKey}".`,
          `Allocated unique container ID ${containerId.slice(0, 12)} and assigned name "${containerName}".`,
          `Connected container to "${networkName}" network with IP ${assignedIp}.`,
          ports.length > 0 ? `Configured port bridge forwarding ${ports.map((p) => `localhost:${p.hostPort} -> :${p.containerPort}`).join(', ')}.` : 'No external host ports bound.',
          `Started primary process "${finalCmd}" inside the isolated container environment.`,
        ],
        why: `Docker containers isolate execution into lightweight userspace instances sharing the host kernel, preventing dependency conflicts and ensuring reproducible runtimes.`,
      },
      beginnerBreakdown,
      affectedResources: [{ type: 'container', id: containerId, action: 'start' }],
    };
  }

  private handlePs(parsed: ParsedCommand): CommandExecutionResult {
    const showAll = Boolean(parsed.flags.all || parsed.flags.a);
    const quiet = Boolean(parsed.flags.quiet || parsed.flags.q);

    const containers = Object.values(this.state.containers).filter(
      (c) => showAll || c.status === 'running' || c.status === 'restarting'
    );

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
      const status = (c.status === 'running' ? 'Up ' + this.formatTimeAgo(c.startedAt || c.created) : `Exited (${c.exitCode || 0})`).padEnd(14);
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

  private handleImages(parsed: ParsedCommand): CommandExecutionResult {
    const images = Object.values(this.state.images);
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

  private handlePull(parsed: ParsedCommand): CommandExecutionResult {
    const imageName = parsed.positionalArgs[0];
    if (!imageName) {
      return {
        stdout: '',
        stderr: '"docker pull" requires at least 1 argument.\nSee \'docker pull --help\'.',
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

    this.recordEvent('image', 'pull', this.state.images[key].id, key);
    this.notify();

    return {
      stdout: `Using default tag: ${key.split(':')[1]}\n${key.split(':')[1]}: Pulling from library/${key.split(':')[0]}\nDigest: sha256:${this.generateId(32)}\nStatus: Downloaded newer image for ${key}\ndocker.io/library/${key}`,
      stderr: '',
      exitCode: 0,
      affectedResources: [{ type: 'image', id: this.state.images[key].id, action: 'pull' }],
    };
  }

  private handleStop(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker stop" requires at least 1 container argument.', exitCode: 1 };
    }

    const stopped: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return { stdout: '', stderr: `Error response from daemon: No such container: ${target}`, exitCode: 1 };
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
        summary: `Sent SIGTERM signal to main process, transitioning container state from 'running' to 'stopped'.`,
        steps: [
          `Sent SIGTERM (graceful shutdown) to PID 1 inside container.`,
          `Processes terminated cleanly.`,
          `Container state changed to Stopped (data and configurations remain intact).`,
        ],
        why: `Stopping a container preserves its filesystem layers, volume mounts, and network configurations so it can be resumed with 'docker start'.`,
      },
    };
  }

  private handleStart(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker start" requires at least 1 container argument.', exitCode: 1 };
    }

    const started: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return { stdout: '', stderr: `Error response from daemon: No such container: ${target}`, exitCode: 1 };
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

  private handleRestart(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker restart" requires at least 1 container argument.', exitCode: 1 };
    }

    for (const target of targets) {
      const container = this.findContainer(target);
      if (container) {
        container.status = 'running';
        container.startedAt = Date.now();
        this.recordEvent('container', 'restart', container.id, container.name);
      }
    }
    this.notify();
    return { stdout: targets.join('\n'), stderr: '', exitCode: 0 };
  }

  private handleRm(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    const force = Boolean(parsed.flags.force || parsed.flags.f);
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker rm" requires at least 1 container argument.', exitCode: 1 };
    }

    const removed: string[] = [];
    for (const target of targets) {
      const container = this.findContainer(target);
      if (!container) {
        return { stdout: '', stderr: `Error response from daemon: No such container: ${target}`, exitCode: 1 };
      }
      if (container.status === 'running' && !force) {
        return {
          stdout: '',
          stderr: `Error response from daemon: You cannot remove a running container ${container.name} (${container.id.slice(0, 12)}). Stop the container before attempting removal or force remove with -f`,
          exitCode: 1,
        };
      }

      // Remove from attached networks
      for (const net of Object.values(this.state.networks)) {
        net.containers = net.containers.filter((cid) => cid !== container.id);
      }

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
        summary: `Container read-write writable layer destroyed. Volumes and images remain unaffected.`,
        steps: [
          `Detached container from all connected networks.`,
          `Unmounted volumes (persistent volume data preserved).`,
          `Deleted the container's ephemeral read-write filesystem layer.`,
        ],
        why: `Containers are designed to be ephemeral and disposable. Persistent state should always be stored in Docker Volumes.`,
      },
    };
  }

  private handleRmi(parsed: ParsedCommand): CommandExecutionResult {
    const targets = parsed.positionalArgs;
    if (targets.length === 0) {
      return { stdout: '', stderr: '"docker rmi" requires at least 1 image argument.', exitCode: 1 };
    }

    const unassigned: string[] = [];
    for (const target of targets) {
      const key = target.includes(':') ? target : `${target}:latest`;
      const img = this.state.images[key] || Object.values(this.state.images).find((i) => i.id.includes(target));

      if (!img) {
        return { stdout: '', stderr: `Error response from daemon: No such image: ${target}`, exitCode: 1 };
      }

      // Check if image is used by existing container
      const inUse = Object.values(this.state.containers).find((c) => c.imageId === img.id || c.image === key);
      if (inUse) {
        return {
          stdout: '',
          stderr: `Error response from daemon: conflict: unable to remove repository reference "${target}" (must be forced) - container ${inUse.id.slice(0, 12)} is using its referenced image ${img.id.slice(0, 12)}`,
          exitCode: 1,
        };
      }

      const foundKey = Object.keys(this.state.images).find((k) => this.state.images[k] === img);
      if (foundKey) delete this.state.images[foundKey];
      this.recordEvent('image', 'delete', img.id, foundKey || target);
      unassigned.push(`Untagged: ${foundKey}\nDeleted: ${img.id}`);
    }
    this.notify();

    return { stdout: unassigned.join('\n'), stderr: '', exitCode: 0 };
  }

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

  private handleExec(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    const execCmd = parsed.positionalArgs.slice(1).join(' ');

    if (!target || !execCmd) {
      return {
        stdout: '',
        stderr: '"docker exec" requires at least 2 arguments: container and command.\nExample: docker exec -it web sh',
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
        stderr: `Error response from daemon: Container ${container.name} is not running`,
        exitCode: 1,
      };
    }

    // Simulated Exec Commands
    if (execCmd === 'sh' || execCmd === 'bash' || execCmd === '/bin/sh' || execCmd === '/bin/bash') {
      return {
        stdout: `Entered container shell [${container.name}:${container.id.slice(0, 8)}]#\nType 'ls', 'env', 'cat', 'curl', 'ping' to inspect container internals.`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (execCmd === 'ls' || execCmd.startsWith('ls ')) {
      return {
        stdout: 'bin   dev   etc   home  lib   media mnt   opt   proc  root  run   sbin  srv   sys   tmp   usr   var   app',
        stderr: '',
        exitCode: 0,
      };
    }

    if (execCmd === 'env') {
      const envLines = Object.entries(container.environment).map(([k, v]) => `${k}=${v}`);
      return {
        stdout: envLines.join('\n') || 'HOSTNAME=' + container.id.slice(0, 12),
        stderr: '',
        exitCode: 0,
      };
    }

    if (execCmd.startsWith('ping ') || execCmd.startsWith('curl ')) {
      const isCurl = execCmd.startsWith('curl');
      const hostTarget = execCmd.replace(/^(ping|curl)\s+(-[a-zA-Z]+\s+)?/, '').replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

      // Check if target matches another container on the same network
      const containerNetworks = Object.keys(container.networks);
      let targetContainer: Container | undefined;

      for (const netName of containerNetworks) {
        const net = this.state.networks[netName];
        if (net) {
          targetContainer = Object.values(this.state.containers).find(
            (c) => c.status === 'running' && (c.name === hostTarget || c.networks[netName]?.ipAddress === hostTarget) && c.networks[netName]
          );
          if (targetContainer) break;
        }
      }

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

      if (targetContainer) {
        if (isCurl) {
          return {
            stdout: `HTTP/1.1 200 OK\nServer: ${targetContainer.image}\nContent-Type: application/json\n\n{"status":"healthy","service":"${targetContainer.name}","ip":"${Object.values(targetContainer.networks)[0]?.ipAddress}"}`,
            stderr: '',
            exitCode: 0,
          };
        }
        return {
          stdout: `PING ${hostTarget} (${Object.values(targetContainer.networks)[0]?.ipAddress}): 56 data bytes\n64 bytes from ${hostTarget}: seq=0 ttl=64 time=0.312 ms\n--- ${hostTarget} ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss`,
          stderr: '',
          exitCode: 0,
        };
      }

      // If cannot find target
      if (isCurl) {
        return {
          stdout: '',
          stderr: `curl: (6) Could not resolve host: ${hostTarget}\nHint: Are both containers attached to the same user-defined bridge network? Default 'bridge' network does not support DNS resolution by container name.`,
          exitCode: 6,
        };
      }
      return {
        stdout: '',
        stderr: `ping: bad address '${hostTarget}'`,
        exitCode: 1,
      };
    }

    return {
      stdout: `Simulated output for '${execCmd}' inside ${container.name}`,
      stderr: '',
      exitCode: 0,
    };
  }

  private handleInspect(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    if (!target) {
      return { stdout: '', stderr: '"docker inspect" requires at least 1 object name/ID.', exitCode: 1 };
    }

    const container = this.findContainer(target);
    if (container) {
      return {
        stdout: JSON.stringify([container], null, 2),
        stderr: '',
        exitCode: 0,
      };
    }

    const img = this.state.images[target] || Object.values(this.state.images).find((i) => i.id.includes(target));
    if (img) {
      return { stdout: JSON.stringify([img], null, 2), stderr: '', exitCode: 0 };
    }

    const net = this.state.networks[target] || Object.values(this.state.networks).find((n) => n.id === target);
    if (net) {
      return { stdout: JSON.stringify([net], null, 2), stderr: '', exitCode: 0 };
    }

    const vol = this.state.volumes[target];
    if (vol) {
      return { stdout: JSON.stringify([vol], null, 2), stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `Error: No such object: ${target}`, exitCode: 1 };
  }

  private handleStats(parsed: ParsedCommand): CommandExecutionResult {
    const target = parsed.positionalArgs[0];
    const containers = target ? [this.findContainer(target)].filter(Boolean) : Object.values(this.state.containers).filter((c) => c.status === 'running');

    const header = 'CONTAINER ID   NAME       CPU %     MEM USAGE / LIMIT     MEM %     NET I/O          PIDS';
    const rows = containers.map((c) => {
      if (!c) return '';
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
      const netName = parsed.positionalArgs[0] || parsed.positionalArgs[1];
      if (!netName) {
        return { stdout: '', stderr: '"docker network create" requires network name.', exitCode: 1 };
      }
      if (this.state.networks[netName]) {
        return { stdout: '', stderr: `Error response from daemon: network with name ${netName} already exists`, exitCode: 1 };
      }

      const id = this.generateId(12);
      this.state.networks[netName] = {
        id,
        name: netName,
        driver: 'bridge',
        subnet: `172.${Math.floor(Math.random() * 80 + 20)}.0.0/16`,
        gateway: `172.${Math.floor(Math.random() * 80 + 20)}.0.1`,
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
          title: `Created Network "${netName}"`,
          summary: `Created an isolated user-defined bridge network with automatic embedded DNS service discovery.`,
          steps: [
            `Allocated virtual Linux bridge interface for "${netName}".`,
            `Configured embedded Docker DNS server at 127.0.0.11 for container name resolution.`,
          ],
          why: `User-defined bridge networks allow containers to discover each other automatically by container name without hardcoded IP addresses.`,
        },
      };
    }

    if (subcommand === 'connect') {
      const netName = parsed.positionalArgs[0];
      const containerName = parsed.positionalArgs[1];
      const net = this.state.networks[netName];
      const container = this.findContainer(containerName);

      if (!net || !container) {
        return { stdout: '', stderr: `Error: Network or container not found.`, exitCode: 1 };
      }

      if (!net.containers.includes(container.id)) {
        net.containers.push(container.id);
        container.networks[netName] = {
          ipAddress: `172.18.0.${this.ipCounter++}`,
          gateway: net.gateway,
          aliases: [container.name],
        };
        this.recordEvent('network', 'connect', net.id, netName, { container: container.name });
        this.notify();
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (subcommand === 'disconnect') {
      const netName = parsed.positionalArgs[0];
      const containerName = parsed.positionalArgs[1];
      const net = this.state.networks[netName];
      const container = this.findContainer(containerName);

      if (!net || !container) return { stdout: '', stderr: `Error: Not found`, exitCode: 1 };
      net.containers = net.containers.filter((id) => id !== container.id);
      delete container.networks[netName];
      this.recordEvent('network', 'disconnect', net.id, netName, { container: container.name });
      this.notify();
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (subcommand === 'rm') {
      const netName = parsed.positionalArgs[0];
      if (netName === 'bridge' || netName === 'host' || netName === 'none') {
        return { stdout: '', stderr: `Error: '${netName}' is a predefined network and cannot be removed`, exitCode: 1 };
      }
      delete this.state.networks[netName];
      this.notify();
      return { stdout: netName, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `Unknown network subcommand: ${subcommand}`, exitCode: 1 };
  }

  private handleVolume(parsed: ParsedCommand): CommandExecutionResult {
    const subcommand = parsed.subcommand || parsed.positionalArgs[0] || 'ls';

    if (subcommand === 'ls') {
      const header = 'DRIVER    VOLUME NAME';
      const rows = Object.values(this.state.volumes).map((v) => `${v.driver.padEnd(9)} ${v.name}`);
      return { stdout: [header, ...rows].join('\n'), stderr: '', exitCode: 0 };
    }

    if (subcommand === 'create') {
      const volName = parsed.positionalArgs[0] || parsed.positionalArgs[1] || `vol-${this.generateId(6)}`;
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
          title: `Created Volume "${volName}"`,
          summary: `Created persistent storage managed by Docker outside the container lifecycle.`,
          steps: [
            `Allocated host storage directory at /var/lib/docker/volumes/${volName}/_data.`,
            `Ready to be mounted to any container via -v ${volName}:/path.`,
          ],
          why: `Docker volumes decouple data from the container lifecycle so database data and uploaded files survive container deletion.`,
        },
      };
    }

    if (subcommand === 'rm') {
      const volName = parsed.positionalArgs[0];
      if (!this.state.volumes[volName]) {
        return { stdout: '', stderr: `Error: No such volume: ${volName}`, exitCode: 1 };
      }
      delete this.state.volumes[volName];
      this.notify();
      return { stdout: volName, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `Unknown volume subcommand: ${subcommand}`, exitCode: 1 };
  }

  private handleBuild(parsed: ParsedCommand): CommandExecutionResult {
    const tag = parsed.flags.t || parsed.flags.tag || 'custom-app:latest';
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
        { id: `sha256:${this.generateId(8)}`, instruction: 'COPY package*.json ./', sizeMb: 0.2, cached: false, command: 'COPY package*.json ./' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'RUN npm install', sizeMb: 42, cached: false, command: 'RUN npm install' },
        { id: `sha256:${this.generateId(8)}`, instruction: 'COPY . .', sizeMb: 3.7, cached: false, command: 'COPY . .' },
      ],
    };

    this.state.images[tagFull] = newImg;
    this.recordEvent('image', 'build', newImg.id, tagFull);
    this.notify();

    return {
      stdout: `[+] Building 2.4s (7/7) FINISHED\n => [internal] load build definition from Dockerfile\n => => transferring dockerfile: 341B\n => [1/5] FROM docker.io/library/node:22-alpine\n => [2/5] WORKDIR /app\n => [3/5] COPY package*.json ./\n => [4/5] RUN npm install\n => [5/5] COPY . .\n => exporting to image\n => => naming to docker.io/library/${tagFull}\nSuccessfully built ${newImg.id.slice(0, 12)}\nSuccessfully tagged ${tagFull}`,
      stderr: '',
      exitCode: 0,
      explanation: {
        title: `Built Image "${tagFull}"`,
        summary: `Executed Dockerfile instructions layer-by-layer to assemble a new immutable image.`,
        steps: [
          `Pulled base layer from node:22-alpine.`,
          `Applied WORKDIR and COPY steps onto filesystem delta.`,
          `Executed 'RUN npm install' to install dependencies.`,
          `Generated final composite image layer with ID ${newImg.id.slice(0, 12)}.`,
        ],
        why: `Docker image caching skips unchanged layers during future builds to ensure instant builds in CI/CD pipelines.`,
      },
    };
  }

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

  private handleComposeCommand(parsed: ParsedCommand): CommandExecutionResult {
    const cmd = parsed.command || 'ps';

    if (cmd === 'up') {
      // Simulate standard multi-service compose up (e.g. web, api, db)
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

      const services = [
        { name: `${projectName}-frontend-1`, img: 'nginx:alpine', hostPort: 3000, containerPort: 80 },
        { name: `${projectName}-backend-1`, img: 'node:22-alpine', hostPort: 5000, containerPort: 5000 },
        { name: `${projectName}-database-1`, img: 'postgres:16-alpine', hostPort: 5432, containerPort: 5432 },
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
          environment: { PROJECT: projectName, SERVICE: s.name },
          networks: {
            [netName]: { ipAddress: `172.24.0.${this.ipCounter++}`, gateway: '172.24.0.1', aliases: [s.name, s.name.split('-')[1]] },
          },
          mounts: [],
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
            `Created project default network "${netName}".`,
            `Provisioned database with persistent volume.`,
            `Started backend API and frontend reverse proxy.`,
            `Configured internal DNS resolution so services reach each other by name (e.g. http://backend:5000).`,
          ],
          why: `Docker Compose enables declarative multi-container definitions in single YAML files for instant development environments.`,
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

    return { stdout: 'Docker Compose active.', stderr: '', exitCode: 0 };
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
  exec        Execute a command in a running container
  ps          List containers
  build       Build an image from a Dockerfile
  pull        Download an image from a registry
  images      List images
  logs        Fetch the logs of a container
  stop        Stop one or more running containers
  start       Start one or more stopped containers
  restart     Restart one or more containers
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
        (c) => c.name === nameOrId || c.id.startsWith(nameOrId) || c.name === nameOrId.replace('/', '')
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
    const time = new Date().toLocaleTimeString();
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
        { timestamp: time, stream: 'stdout', message: `2026-08-28 20:30:00.123 UTC [1] LOG: starting PostgreSQL 16.2 on x86_64-pc-linux-musl` },
        { timestamp: time, stream: 'stdout', message: `2026-08-28 20:30:00.124 UTC [1] LOG: listening on IPv4 address "0.0.0.0", port 5432` },
        { timestamp: time, stream: 'stdout', message: `2026-08-28 20:30:00.125 UTC [1] LOG: database system is ready to accept connections` },
      ];
    }
    if (repo.includes('redis')) {
      return [
        { timestamp: time, stream: 'stdout', message: `1:M 28 Aug 2026 20:30:00.100 * Running mode=standalone, port=6379.` },
        { timestamp: time, stream: 'stdout', message: `1:M 28 Aug 2026 20:30:00.101 # Server initialized` },
        { timestamp: time, stream: 'stdout', message: `1:M 28 Aug 2026 20:30:00.102 * Ready to accept connections tcp` },
      ];
    }
    return [
      { timestamp: time, stream: 'stdout', message: `Container ${name} initialized with PID 1` },
      { timestamp: time, stream: 'stdout', message: `Application listening on internal port ${ports[0]?.containerPort || 3000}` },
      { timestamp: time, stream: 'stdout', message: `Ready to serve traffic.` },
    ];
  }
}

// Global Singleton Instance for easy client access
let globalDockerEngineInstance: DockerEngine | null = null;

export function getDockerEngine(): DockerEngine {
  if (!globalDockerEngineInstance) {
    globalDockerEngineInstance = new DockerEngine();
  }
  return globalDockerEngineInstance;
}
