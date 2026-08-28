import { Mission } from '@/types/curriculum';

export const DOCKER_MISSIONS: Mission[] = [
  {
    id: 'mission-01',
    number: 1,
    title: 'Mission 1: The Initial Spark',
    tagline: 'Launch an nginx container in detached mode',
    scenario: 'You have been tasked with setting up a baseline web server. Run nginx in detached mode.',
    objectives: [
      {
        id: 'obj-1',
        description: 'At least 1 container is running from nginx image in detached mode',
        verify: (state) => Object.values(state.containers).some((c) => c.image.includes('nginx') && c.status === 'running'),
      },
    ],
    hints: ['Use the command `docker run -d nginx:latest`'],
    solutionSteps: ['docker run -d nginx:latest'],
    rewardBadge: 'Pioneer Cadet',
  },
  {
    id: 'mission-02',
    number: 2,
    title: 'Mission 2: Identity Assignment',
    tagline: 'Run a container named "web-gateway"',
    scenario: 'Anonymous container names (like sharp_curie) make operations confusing. Assign the explicit name `web-gateway`.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Container with name "web-gateway" is running',
        verify: (state) => Object.values(state.containers).some((c) => c.name === 'web-gateway' && c.status === 'running'),
      },
    ],
    hints: ['Use the `--name` flag: `docker run -d --name web-gateway nginx:alpine`'],
    solutionSteps: ['docker run -d --name web-gateway nginx:alpine'],
    rewardBadge: 'Identity Master',
  },
  {
    id: 'mission-03',
    number: 3,
    title: 'Mission 3: External Exposure',
    tagline: 'Expose a web container on host port 8080',
    scenario: 'The frontend development team needs access to the server on http://localhost:8080.',
    objectives: [
      {
        id: 'obj-1',
        description: 'A container is running with host port 8080 published to container port 80',
        verify: (state) =>
          Object.values(state.containers).some(
            (c) => c.status === 'running' && c.ports.some((p) => p.hostPort === 8080 && p.containerPort === 80)
          ),
      },
    ],
    hints: ['Use the `-p 8080:80` port publishing flag.'],
    solutionSteps: ['docker run -d --name web-portal -p 8080:80 nginx:alpine'],
    rewardBadge: 'Port Gateway',
  },
  {
    id: 'mission-04',
    number: 4,
    title: 'Mission 4: Isolated Network Topology',
    tagline: 'Create a custom bridge network named "app-network"',
    scenario: 'Production security policies require microservices to be segregated on a custom bridge network.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Custom network "app-network" exists with bridge driver',
        verify: (state) => Boolean(state.networks['app-network'] && state.networks['app-network'].driver === 'bridge'),
      },
    ],
    hints: ['Use `docker network create app-network`'],
    solutionSteps: ['docker network create app-network'],
    rewardBadge: 'Network Architect',
  },
  {
    id: 'mission-05',
    number: 5,
    title: 'Mission 5: Inter-Container Bridge',
    tagline: 'Run api and web containers on the same custom network',
    scenario: 'Deploy both an `api` container and a `web` container connected to `app-network`.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Container "api" is running on "app-network"',
        verify: (state) => {
          const c = Object.values(state.containers).find((x) => x.name === 'api');
          return Boolean(c && c.status === 'running' && c.networks['app-network']);
        },
      },
      {
        id: 'obj-2',
        description: 'Container "web" is running on "app-network"',
        verify: (state) => {
          const c = Object.values(state.containers).find((x) => x.name === 'web');
          return Boolean(c && c.status === 'running' && c.networks['app-network']);
        },
      },
    ],
    hints: [
      'First create the network if it does not exist: `docker network create app-network`',
      'Run api: `docker run -d --name api --network app-network node:22-alpine`',
      'Run web: `docker run -d --name web --network app-network nginx:alpine`',
    ],
    solutionSteps: [
      'docker network create app-network',
      'docker run -d --name api --network app-network node:22-alpine',
      'docker run -d --name web --network app-network nginx:alpine',
    ],
    rewardBadge: 'Bridge Builder',
  },
  {
    id: 'mission-06',
    number: 6,
    title: 'Mission 6: Persistent Vault',
    tagline: 'Provision a volume named "db-storage" and attach to database',
    scenario: 'Ensure database records survive container recreation by attaching a named volume.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Volume "db-storage" exists',
        verify: (state) => Boolean(state.volumes['db-storage']),
      },
      {
        id: 'obj-2',
        description: 'Postgres container is running with db-storage mounted',
        verify: (state) =>
          Object.values(state.containers).some(
            (c) => c.status === 'running' && c.image.includes('postgres') && c.mounts.some((m) => m.source === 'db-storage')
          ),
      },
    ],
    hints: ['Create volume with `docker volume create db-storage`', 'Run postgres with `-v db-storage:/var/lib/postgresql/data`'],
    solutionSteps: [
      'docker volume create db-storage',
      'docker run -d --name db -v db-storage:/var/lib/postgresql/data postgres:16-alpine',
    ],
    rewardBadge: 'Persistence Sentinel',
  },
  {
    id: 'mission-07',
    number: 7,
    title: 'Mission 7: The Custom Blueprint',
    tagline: 'Build a custom application image tagged "my-service:1.0"',
    scenario: 'Package application code into an immutable Docker image using a build context.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Image "my-service:1.0" exists in local image store',
        verify: (state) => Boolean(state.images['my-service:1.0']),
      },
    ],
    hints: ['Use `docker build -t my-service:1.0 .`'],
    solutionSteps: ['docker build -t my-service:1.0 .'],
    rewardBadge: 'Image Crafter',
  },
  {
    id: 'mission-08',
    number: 8,
    title: 'Mission 8: Declarative Orchestra',
    tagline: 'Launch a 3-tier application with Docker Compose',
    scenario: 'Orchestrate frontend, backend API, and database in a single declarative command.',
    objectives: [
      {
        id: 'obj-1',
        description: 'At least 3 compose services are active in project',
        verify: (state) => Object.values(state.containers).filter((c) => c.labels['com.docker.compose.project']).length >= 3,
      },
    ],
    hints: ['Use `docker compose up -d` in the terminal.'],
    solutionSteps: ['docker compose up -d'],
    rewardBadge: 'Compose Virtuoso',
  },
  {
    id: 'mission-09',
    number: 9,
    title: 'Mission 9: Resource Governor',
    tagline: 'Run a container with a 256MB memory boundary',
    scenario: 'Prevent memory runaway in multi-tenant environments by placing a 256MB memory cap on a cache container.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Container is running with memory limit set to 256MB',
        verify: (state) =>
          Object.values(state.containers).some((c) => c.status === 'running' && c.resources.memoryLimitMb === 256),
      },
    ],
    hints: ['Use the `--memory=256m` flag with `docker run`.'],
    solutionSteps: ['docker run -d --name redis-cache --memory=256m redis:7-alpine'],
    rewardBadge: 'Resource Governor',
  },
  {
    id: 'mission-10',
    number: 10,
    title: 'Mission 10: Grand Orchestration',
    tagline: 'Complete 3-tier architecture with custom network, volumes, and ports',
    scenario: 'Assemble the ultimate production-grade architecture: custom network `prod-net`, persistent volume `prod-data`, backend API, and exposed frontend reverse proxy.',
    objectives: [
      {
        id: 'obj-1',
        description: 'Network "prod-net" exists',
        verify: (state) => Boolean(state.networks['prod-net']),
      },
      {
        id: 'obj-2',
        description: 'Volume "prod-data" exists',
        verify: (state) => Boolean(state.volumes['prod-data']),
      },
      {
        id: 'obj-3',
        description: 'Database container running on prod-net with prod-data mounted',
        verify: (state) =>
          Object.values(state.containers).some(
            (c) => c.status === 'running' && c.networks['prod-net'] && c.mounts.some((m) => m.source === 'prod-data')
          ),
      },
      {
        id: 'obj-4',
        description: 'Frontend container running on prod-net with host port 8080 exposed',
        verify: (state) =>
          Object.values(state.containers).some(
            (c) => c.status === 'running' && c.networks['prod-net'] && c.ports.some((p) => p.hostPort === 8080)
          ),
      },
    ],
    hints: [
      '1. Create network: `docker network create prod-net`',
      '2. Create volume: `docker volume create prod-data`',
      '3. Run db: `docker run -d --name prod-db --network prod-net -v prod-data:/data postgres:16-alpine`',
      '4. Run frontend: `docker run -d --name prod-web --network prod-net -p 8080:80 nginx:alpine`',
    ],
    solutionSteps: [
      'docker network create prod-net',
      'docker volume create prod-data',
      'docker run -d --name prod-db --network prod-net -v prod-data:/var/lib/postgresql/data postgres:16-alpine',
      'docker run -d --name prod-web --network prod-net -p 8080:80 nginx:alpine',
    ],
    rewardBadge: 'Docker Grandmaster',
  },
];
