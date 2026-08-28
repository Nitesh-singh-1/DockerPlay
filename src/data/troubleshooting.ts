import { TroubleshootingChallenge } from '@/types/curriculum';
import { DockerState } from '@/types/docker';
import { DEFAULT_IMAGES } from '@/lib/simulator/DefaultImages';

export const TROUBLESHOOTING_CHALLENGES: TroubleshootingChallenge[] = [
  {
    id: 'challenge-01',
    title: 'The Crash Loop Container (Exit Code 1)',
    difficulty: 'beginner',
    symptom: 'The API container `auth-api` stops immediately after running and shows status `Exited (1)`.',
    scenarioDescription: 'A newly deployed authentication container exits right after startup. Inspect the logs to determine the missing configuration and fix it.',
    setupPreset: 'crash-loop',
    hints: [
      'Run `docker ps -a` to see exited containers.',
      'Run `docker logs auth-api` to inspect the error stack trace.',
      'Notice the error: `FATAL: Missing required environment variable DB_HOST`.',
      'Remove the broken container and rerun it with `-e DB_HOST=postgres`.',
    ],
    suggestedCommands: ['docker ps -a', 'docker logs auth-api', 'docker inspect auth-api'],
    solutionExplanation: 'The application crashed because the entrypoint script required the `DB_HOST` environment variable. Passing `-e DB_HOST=postgres` allows the application to connect and stay running.',
    verifyFixed: (state: DockerState) => {
      const c = Object.values(state.containers).find((x) => x.name === 'auth-api');
      return Boolean(c && c.status === 'running' && c.environment['DB_HOST']);
    },
  },
  {
    id: 'challenge-02',
    title: 'The Silent Web Server (Port Mismatch)',
    difficulty: 'beginner',
    symptom: 'The web service is marked "Running", but users visiting `http://localhost:8080` get connection refused.',
    scenarioDescription: 'An engineer ran an nginx web server, but traffic on host port 8080 never reaches the application. Inspect port configuration to fix the route.',
    setupPreset: 'port-mismatch',
    hints: [
      'Check `docker ps` to inspect currently mapped ports.',
      'Notice that the container mapped host port 8080 to container port 8080, but Nginx listens internally on port 80!',
      'Fix by stopping and running with `-p 8080:80`.',
    ],
    suggestedCommands: ['docker ps', 'docker inspect web-app'],
    solutionExplanation: 'Nginx listens on internal port 80 by default. Mapping `-p 8080:8080` sent host traffic to an empty port inside the container instead of port 80.',
    verifyFixed: (state: DockerState) => {
      const c = Object.values(state.containers).find((x) => x.name === 'web-app');
      return Boolean(c && c.status === 'running' && c.ports.some((p) => p.hostPort === 8080 && p.containerPort === 80));
    },
  },
  {
    id: 'challenge-03',
    title: 'The Isolated Microservices (Network Split)',
    difficulty: 'intermediate',
    symptom: 'The frontend container `storefront` cannot connect to `order-api` on `http://order-api:5000`.',
    scenarioDescription: 'The frontend and backend services are both running, but DNS queries and HTTP calls between them fail.',
    setupPreset: 'network-split',
    hints: [
      'Inspect networks using `docker network ls` and `docker inspect store-net`.',
      'Notice that `storefront` is on `store-net`, while `order-api` was accidentally launched on the default `bridge` network!',
      'Containers on default bridge cannot resolve each other by container name.',
      'Connect `order-api` to `store-net` using `docker network connect store-net order-api`.',
    ],
    suggestedCommands: ['docker network ls', 'docker inspect store-net', 'docker exec storefront ping order-api'],
    solutionExplanation: 'Docker embedded DNS service discovery is only enabled on custom user-defined networks. Connecting both containers to `store-net` establishes DNS name resolution.',
    verifyFixed: (state: DockerState) => {
      const sf = Object.values(state.containers).find((x) => x.name === 'storefront');
      const api = Object.values(state.containers).find((x) => x.name === 'order-api');
      const net = state.networks['store-net'];
      return Boolean(
        sf && api && net &&
        sf.networks['store-net'] && api.networks['store-net'] &&
        sf.status === 'running' && api.status === 'running'
      );
    },
  },
  {
    id: 'challenge-04',
    title: 'The Amnesiac Database (Missing Volume)',
    difficulty: 'intermediate',
    symptom: 'Every time the database container is restarted or updated, all table rows disappear.',
    scenarioDescription: 'A PostgreSQL container was deployed without persistent storage. Provision a named volume `pgdata` and mount it to `/var/lib/postgresql/data`.',
    setupPreset: 'amnesiac-db',
    hints: [
      'Inspect `docker volume ls`.',
      'Create a named volume: `docker volume create pgdata`.',
      'Run postgres with `-v pgdata:/var/lib/postgresql/data`.',
    ],
    suggestedCommands: ['docker volume ls', 'docker inspect postgres-db'],
    solutionExplanation: 'Without a volume mount, database files are written to the container ephemeral read-write layer and get wiped on container removal. Attaching a named volume preserves data on the host disk.',
    verifyFixed: (state: DockerState) => {
      const c = Object.values(state.containers).find((x) => x.name === 'postgres-db' || x.image.includes('postgres'));
      return Boolean(
        c && c.status === 'running' &&
        c.mounts.some((m) => m.source === 'pgdata' && m.destination.includes('postgresql'))
      );
    },
  },
  {
    id: 'challenge-05',
    title: 'The Host Port Conflict (Port 3000 Collision)',
    difficulty: 'intermediate',
    symptom: 'Running a new Next.js dashboard container fails with `port is already allocated`.',
    scenarioDescription: 'An existing background container is already bound to host port 3000. Identify the conflicting container or rebind to port 3001.',
    setupPreset: 'port-collision',
    hints: [
      'Run `docker ps` to see which container is holding port 3000.',
      'Either stop the legacy container with `docker stop <name>` or launch the new service on `-p 3001:3000`.',
    ],
    suggestedCommands: ['docker ps', 'docker stop legacy-app'],
    solutionExplanation: 'Only one process or container on the host can bind to a specific TCP port (0.0.0.0:3000) at any given time.',
    verifyFixed: (state: DockerState) => {
      const c = Object.values(state.containers).find((x) => x.name === 'nextjs-dash');
      return Boolean(c && c.status === 'running' && c.ports.length > 0);
    },
  },
];

export function getScenarioPresetState(presetName: string): DockerState {
  const base = {
    images: { ...DEFAULT_IMAGES },
    containers: {},
    networks: {
      bridge: { id: 'br-01', name: 'bridge', driver: 'bridge' as const, subnet: '172.17.0.0/16', gateway: '172.17.0.1', internal: false, containers: [] },
    },
    volumes: {},
    events: [],
    composeProjects: {},
  };

  if (presetName === 'crash-loop') {
    return {
      ...base,
      containers: {
        'auth-api-01': {
          id: 'auth-api-01',
          name: 'auth-api',
          image: 'node:22-alpine',
          imageId: 'sha256:f1e2d3c4b5a6',
          status: 'exited',
          health: 'unhealthy',
          command: 'node server.js',
          created: Date.now() - 60000,
          finishedAt: Date.now() - 58000,
          exitCode: 1,
          ports: [],
          environment: { PORT: '4000' },
          networks: { bridge: { ipAddress: '172.17.0.2', gateway: '172.17.0.1', aliases: ['auth-api'] } },
          mounts: [],
          labels: {},
          logs: [
            { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Starting Authentication Microservice v1.4.0...' },
            { timestamp: new Date().toISOString(), stream: 'stderr', message: 'FATAL: Missing required environment variable DB_HOST.' },
            { timestamp: new Date().toISOString(), stream: 'stderr', message: 'Process exited with code 1.' },
          ],
          resources: { memoryUsageMb: 0, cpuPercent: 0, networkRxKb: 0, networkTxKb: 0, processCount: 0 },
          restartPolicy: 'no',
        },
      },
    };
  }

  if (presetName === 'port-mismatch') {
    return {
      ...base,
      containers: {
        'web-app-01': {
          id: 'web-app-01',
          name: 'web-app',
          image: 'nginx:alpine',
          imageId: 'sha256:e3f4a5b6c7d8',
          status: 'running',
          health: 'healthy',
          command: 'nginx -g "daemon off;"',
          created: Date.now() - 120000,
          startedAt: Date.now() - 120000,
          ports: [{ hostPort: 8080, containerPort: 8080, protocol: 'tcp' }],
          environment: {},
          networks: { bridge: { ipAddress: '172.17.0.3', gateway: '172.17.0.1', aliases: ['web-app'] } },
          mounts: [],
          labels: {},
          logs: [
            { timestamp: new Date().toISOString(), stream: 'stdout', message: 'nginx/1.27.0 started on internal port 80' },
            { timestamp: new Date().toISOString(), stream: 'stdout', message: 'Notice: host port 8080 mapped to internal container port 8080, but nothing is listening on 8080.' },
          ],
          resources: { memoryUsageMb: 24, cpuPercent: 0.1, networkRxKb: 10, networkTxKb: 5, processCount: 2 },
          restartPolicy: 'no',
        },
      },
    };
  }

  if (presetName === 'network-split') {
    return {
      ...base,
      networks: {
        ...base.networks,
        'store-net': { id: 'net-store-01', name: 'store-net', driver: 'bridge', subnet: '172.22.0.0/16', gateway: '172.22.0.1', internal: false, containers: ['sf-01'] },
      },
      containers: {
        'sf-01': {
          id: 'sf-01',
          name: 'storefront',
          image: 'nginx:alpine',
          imageId: 'sha256:e3f4a5b6c7d8',
          status: 'running',
          health: 'healthy',
          command: 'nginx',
          created: Date.now() - 150000,
          ports: [{ hostPort: 3000, containerPort: 80, protocol: 'tcp' }],
          environment: { API_URL: 'http://order-api:5000' },
          networks: { 'store-net': { ipAddress: '172.22.0.2', gateway: '172.22.0.1', aliases: ['storefront'] } },
          mounts: [],
          labels: {},
          logs: [{ timestamp: new Date().toISOString(), stream: 'stderr', message: 'Error: getaddrinfo ENOTFOUND order-api on store-net' }],
          resources: { memoryUsageMb: 28, cpuPercent: 0.2, networkRxKb: 40, networkTxKb: 12, processCount: 2 },
          restartPolicy: 'no',
        },
        'api-01': {
          id: 'api-01',
          name: 'order-api',
          image: 'node:22-alpine',
          imageId: 'sha256:f1e2d3c4b5a6',
          status: 'running',
          health: 'healthy',
          command: 'node app.js',
          created: Date.now() - 140000,
          ports: [],
          environment: { PORT: '5000' },
          networks: { bridge: { ipAddress: '172.17.0.4', gateway: '172.17.0.1', aliases: ['order-api'] } },
          mounts: [],
          labels: {},
          logs: [{ timestamp: new Date().toISOString(), stream: 'stdout', message: 'Order API listening on port 5000 (bridge net)' }],
          resources: { memoryUsageMb: 45, cpuPercent: 0.3, networkRxKb: 20, networkTxKb: 10, processCount: 2 },
          restartPolicy: 'no',
        },
      },
    };
  }

  return base;
}
