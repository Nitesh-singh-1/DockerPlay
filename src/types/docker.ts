export type ContainerStatus = 'created' | 'running' | 'paused' | 'stopped' | 'exited' | 'restarting';
export type HealthStatus = 'healthy' | 'unhealthy' | 'starting' | 'none';

export interface PortMapping {
  hostPort: number;
  containerPort: number;
  protocol: 'tcp' | 'udp';
  hostIp?: string;
}

export interface VolumeMount {
  source: string;       // Volume name (e.g. 'db_data') or host path (e.g. './src')
  destination: string;  // Target path inside container (e.g. '/var/lib/postgresql/data')
  type: 'volume' | 'bind';
  readonly: boolean;
}

export interface ContainerNetworkConfig {
  ipAddress: string;
  gateway: string;
  aliases: string[];
}

export interface ContainerLogEntry {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  message: string;
}

export interface ContainerResourceStats {
  memoryLimitMb?: number;
  cpuQuota?: number;
  memoryUsageMb: number;
  cpuPercent: number;
  networkRxKb: number;
  networkTxKb: number;
  processCount: number;
}

export interface Container {
  id: string;              // 12-char SHA e.g. 'c4a8f921e0b3'
  name: string;            // 'web', 'api', 'db'
  image: string;           // 'nginx:alpine', 'postgres:16'
  imageId: string;
  status: ContainerStatus;
  health: HealthStatus;
  command: string;
  created: number;         // Timestamp in ms
  startedAt?: number;
  finishedAt?: number;
  exitCode?: number;
  ports: PortMapping[];
  environment: Record<string, string>;
  networks: Record<string, ContainerNetworkConfig>;
  mounts: VolumeMount[];
  labels: Record<string, string>;
  logs: ContainerLogEntry[];
  resources: ContainerResourceStats;
  restartPolicy: 'no' | 'always' | 'on-failure' | 'unless-stopped';
}

export interface ImageLayer {
  id: string;              // e.g. 'sha256:8b4d...'
  instruction: string;     // e.g. 'FROM node:22-alpine'
  sizeMb: number;
  cached: boolean;
  command: string;
}

export interface DockerImage {
  id: string;              // e.g. 'sha256:7a92bf...'
  repository: string;      // 'nginx', 'node', 'myapp'
  tag: string;             // 'latest', 'alpine', '1.0'
  sizeMb: number;
  created: number;
  layers: ImageLayer[];
  exposedPorts: number[];
  env: Record<string, string>;
  workdir: string;
  entrypoint?: string[];
  cmd: string[];
  labels?: Record<string, string>;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: 'bridge' | 'host' | 'none' | 'overlay';
  subnet: string;          // e.g. '172.18.0.0/16'
  gateway: string;         // e.g. '172.18.0.1'
  internal: boolean;
  containers: string[];    // Array of Container IDs connected
  labels?: Record<string, string>;
}

export interface DockerVolume {
  id: string;
  name: string;
  driver: 'local';
  mountpoint: string;
  sizeMb: number;
  created: number;
  data: Record<string, string>; // Virtual files/keys stored in volume
  labels?: Record<string, string>;
}

export interface DockerEvent {
  id: string;
  timestamp: number;
  type: 'container' | 'image' | 'network' | 'volume' | 'daemon';
  action: string;          // 'create', 'start', 'die', 'destroy', 'pull', 'connect', 'build'
  actorId: string;
  actorName: string;
  attributes: Record<string, string>;
}

export interface ComposeService {
  name: string;
  image?: string;
  build?: {
    context: string;
    dockerfile?: string;
  };
  ports?: string[];
  environment?: Record<string, string> | string[];
  networks?: string[];
  volumes?: string[];
  depends_on?: string[];
  restart?: string;
  command?: string | string[];
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
  };
}

export interface ComposeProject {
  name: string;
  services: Record<string, ComposeService>;
  networks: Record<string, any>;
  volumes: Record<string, any>;
  status: 'running' | 'stopped' | 'partial';
}

export interface DockerState {
  images: Record<string, DockerImage>;
  containers: Record<string, Container>;
  networks: Record<string, DockerNetwork>;
  volumes: Record<string, DockerVolume>;
  events: DockerEvent[];
  composeProjects: Record<string, ComposeProject>;
}

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  explanation?: {
    title: string;
    summary: string;
    steps: string[];
    why: string;
  };
  beginnerBreakdown?: Array<{
    token: string;
    role: string;
    description: string;
  }>;
  affectedResources?: {
    type: 'container' | 'image' | 'network' | 'volume' | 'compose';
    id: string;
    action: string;
  }[];
}
