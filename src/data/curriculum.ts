import { Chapter } from '@/types/curriculum';

export const CURRICULUM_CHAPTERS: Chapter[] = [
  {
    id: 'ch-01',
    slug: 'what-is-docker',
    order: 1,
    title: 'What is Docker?',
    tagline: 'Containers vs Virtual Machines & Core Architecture',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    summary: 'Understand the fundamental problem Docker solves, how containers package code and dependencies, and how Docker compares to traditional Virtual Machines.',
    learningObjectives: [
      'Understand the difference between Virtual Machines and Containers',
      'Learn the roles of Docker CLI, Docker Daemon (Engine), and Registries',
      'Understand why "it works on my machine" is solved by containerization',
    ],
    sections: [
      {
        id: 'sec-01-problem',
        title: 'The Problem: "It Works on My Machine"',
        content: `Before Docker, shipping software meant dealing with environment discrepancies: different OS versions, conflicting library versions, missing environment variables, and varying system dependencies.\n\nDocker solves this by bundling your application code, system libraries, configuration, and runtime environment into an immutable, portable artifact called an **Image**. Every container instance spawned from that image runs identically on developer laptops, CI/CD pipelines, and cloud production servers.`,
        visualHighlight: 'architecture',
      },
      {
        id: 'sec-01-vm-vs-container',
        title: 'Containers vs. Virtual Machines',
        content: `### Virtual Machines (Hardware-level Virtualization)
* Each VM packages a complete **Guest Operating System** (GBs in size).
* Relies on a Hypervisor layer on top of hardware.
* Slow boot times (minutes) and heavy CPU/RAM overhead.

### Containers (OS-level Virtualization)
* Containers share the **Host OS Linux Kernel**.
* Each container is an isolated userspace process.
* Lightweight (MBs in size), sub-second startup times, near-native performance.`,
        visualHighlight: 'architecture',
      },
      {
        id: 'sec-01-architecture',
        title: 'Docker Engine Anatomy',
        content: `The Docker system consists of three main components:
1. **Docker CLI (\`docker\`)**: The command-line client you interact with.
2. **Docker Daemon (\`dockerd\`)**: The background engine managing containers, images, virtual networks, and storage volumes.
3. **Container Registry (Docker Hub)**: A cloud repository for sharing and downloading container images.`,
        terminalSnippet: 'docker --help',
        visualHighlight: 'architecture',
      },
    ],
    exercise: {
      id: 'ex-01',
      title: 'First Contact with Docker CLI',
      description: 'Run your very first Docker command in the terminal to inspect available commands and check Docker images.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Inspect local images using the Docker CLI',
          task: 'Type `docker images` into the terminal and press Enter.',
          expectedCommandPattern: '^docker\\s+images',
          validator: (state, lastCmd) => Boolean(lastCmd && lastCmd.includes('images')),
          hints: ['Type "docker images" into the terminal.', 'Press Enter to execute the command.'],
          solution: 'docker images',
        },
      ],
    },
    quiz: {
      id: 'quiz-01',
      title: 'Chapter 1 Quiz: Docker Foundations',
      passingScore: 75,
      questions: [
        {
          id: 'q1-1',
          question: 'What is the primary difference between a container and a virtual machine?',
          options: [
            { id: 'a', text: 'Containers require their own dedicated hypervisor', isCorrect: false, explanation: 'Hypervisors are used by VMs, not containers.' },
            { id: 'b', text: 'Containers share the host OS kernel and isolate userspace processes', isCorrect: true, explanation: 'Correct! Containers share the host kernel while isolating processes via namespaces and cgroups.' },
            { id: 'c', text: 'Virtual machines are faster and lighter than containers', isCorrect: false, explanation: 'Containers are much lighter and start significantly faster than VMs.' },
            { id: 'd', text: 'Containers can only run Python applications', isCorrect: false, explanation: 'Containers can run any software stack.' },
          ],
          conceptExplanation: 'Containers achieve lightweight virtualization by sharing the host operating system kernel.',
        },
        {
          id: 'q1-2',
          question: 'Which component is responsible for creating and running containers?',
          options: [
            { id: 'a', text: 'Docker CLI', isCorrect: false, explanation: 'The CLI is just a client that sends API commands.' },
            { id: 'b', text: 'Docker Daemon (Engine)', isCorrect: true, explanation: 'Correct! The Docker Daemon (dockerd) manages images, containers, networks, and volumes.' },
            { id: 'c', text: 'Docker Hub', isCorrect: false, explanation: 'Docker Hub is an online image registry.' },
            { id: 'd', text: 'Git', isCorrect: false, explanation: 'Git is a version control system.' },
          ],
          conceptExplanation: 'The Docker Daemon handles the core execution and orchestration work.',
        },
      ],
    },
  },
  {
    id: 'ch-02',
    slug: 'docker-images',
    order: 2,
    title: 'Docker Images & Layers',
    tagline: 'Blueprints, Registries, Layers & Immutability',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    summary: 'Understand what a Docker image is, how layered storage makes builds fast and efficient, and how to pull and manage images.',
    learningObjectives: [
      'Differentiate between an Image (Blueprint) and a Container (Instance)',
      'Understand read-only image layers and union filesystems',
      'Use `docker pull`, `docker images`, and `docker rmi`',
    ],
    sections: [
      {
        id: 'sec-02-blueprint',
        title: 'Image vs. Container: The Blueprint Analogy',
        content: `Think of a **Docker Image** as an architect's blueprint or a class in object-oriented programming. It is an immutable, read-only template containing the OS files, dependencies, and application code.\n\nA **Container** is a running instance of that blueprint—just like an instantiated object in memory. You can create dozens of separate containers from a single image.`,
        visualHighlight: 'images',
      },
      {
        id: 'sec-02-layers',
        title: 'Layer Stack & Union Filesystem',
        content: `Docker images are built as stacks of **read-only layers**. Each instruction in a build adds a new layer:\n\n* **Base Layer**: Minimal Linux filesystem (e.g. Alpine 7MB)\n* **Dependency Layer**: Packages installed via apt/apk\n* **Application Layer**: Source code and configs\n\nWhen multiple images share common base layers, Docker only downloads and stores the layer once on disk!`,
        visualHighlight: 'images',
      },
    ],
    exercise: {
      id: 'ex-02',
      title: 'Pull and Inspect an Image',
      description: 'Pull the lightweight `postgres:16-alpine` database image into your local image cache.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Pull the postgres:16-alpine image',
          task: 'Run `docker pull postgres:16-alpine` in the terminal.',
          expectedCommandPattern: '^docker\\s+pull\\s+postgres',
          validator: (state) => Object.keys(state.images).some((k) => k.includes('postgres')),
          hints: ['Use the pull command: docker pull postgres:16-alpine', 'Make sure to specify the tag :16-alpine'],
          solution: 'docker pull postgres:16-alpine',
        },
      ],
    },
    quiz: {
      id: 'quiz-02',
      title: 'Chapter 2 Quiz: Docker Images',
      passingScore: 75,
      questions: [
        {
          id: 'q2-1',
          question: 'What happens when multiple containers are launched from the same Docker image?',
          options: [
            { id: 'a', text: 'Docker duplicates the entire image on disk for each container', isCorrect: false, explanation: 'Images are read-only and shared across containers.' },
            { id: 'b', text: 'Each container gets its own thin writable top layer while sharing the immutable image layers', isCorrect: true, explanation: 'Correct! Docker uses a copy-on-write strategy where all containers share the base image layers.' },
            { id: 'c', text: 'Only one container can run at a time per image', isCorrect: false, explanation: 'You can run unlimited containers from one image.' },
          ],
          conceptExplanation: 'Containers share base image layers and add a thin ephemeral read-write layer on top.',
        },
      ],
    },
  },
  {
    id: 'ch-03',
    slug: 'containers-lifecycle',
    order: 3,
    title: 'Container Lifecycle & Management',
    tagline: 'Running, Stopping, Inspecting, and Removing Containers',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    summary: 'Master container execution, status transitions (Created, Running, Stopped, Exited), and core management commands.',
    learningObjectives: [
      'Understand the full container lifecycle state machine',
      'Run containers in detached and interactive modes',
      'Master `docker run`, `docker ps -a`, `docker stop`, `docker start`, and `docker rm`',
    ],
    sections: [
      {
        id: 'sec-03-lifecycle',
        title: 'The Container State Machine',
        content: `A container transitions through distinct states during its life:\n\n1. **Created**: Layer allocated, network assigned, not yet started.\n2. **Running**: Process actively executing inside container.\n3. **Stopped / Exited**: Main process has exited or received SIGTERM/SIGKILL.\n4. **Removed**: Container and its writable layer completely deleted.`,
        visualHighlight: 'containers',
      },
    ],
    exercise: {
      id: 'ex-03',
      title: 'Run, Stop, and Remove a Container',
      description: 'Run an nginx web server, verify it with `docker ps`, stop it, and restart it.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Run an nginx container in detached mode named "web"',
          task: 'Run `docker run -d --name web nginx:latest`',
          validator: (state) => Boolean(state.containers['web'] || Object.values(state.containers).find((c) => c.name === 'web' && c.status === 'running')),
          hints: ['Use the -d flag for detached mode', 'Use --name web to give it a name'],
          solution: 'docker run -d --name web nginx:latest',
        },
        {
          id: 'step-2',
          instruction: 'Stop the web container',
          task: 'Run `docker stop web`',
          validator: (state) => {
            const c = Object.values(state.containers).find((c) => c.name === 'web');
            return Boolean(c && c.status === 'stopped');
          },
          hints: ['Use docker stop web'],
          solution: 'docker stop web',
        },
      ],
    },
    quiz: {
      id: 'quiz-03',
      title: 'Chapter 3 Quiz: Container Lifecycle',
      passingScore: 75,
      questions: [
        {
          id: 'q3-1',
          question: 'What is the effect of the -d flag in `docker run -d nginx`?',
          options: [
            { id: 'a', text: 'Deletes the container immediately upon finish', isCorrect: false, explanation: 'That is the --rm flag.' },
            { id: 'b', text: 'Runs the container in detached (background) mode and prints the container ID', isCorrect: true, explanation: 'Correct! -d detaches the terminal and runs the container in the background.' },
            { id: 'c', text: 'Disables networking for the container', isCorrect: false, explanation: 'Networking remains active in detached mode.' },
          ],
          conceptExplanation: 'Detached mode (-d) lets servers run in the background while releasing your terminal.',
        },
      ],
    },
  },
  {
    id: 'ch-04',
    slug: 'mastering-docker-run',
    order: 4,
    title: 'Mastering `docker run` Flags',
    tagline: 'Environment Variables, Auto-removal, Restart Policies & Memory Limits',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    summary: 'Deep dive into every essential flag of docker run: environment injection, restart policies, resource quotas, and cleanup options.',
    learningObjectives: [
      'Inject configuration using `-e KEY=VALUE`',
      'Configure automatic restarts with `--restart always`',
      'Set container resource boundaries with `--memory` and `--cpus`',
    ],
    sections: [
      {
        id: 'sec-04-flags',
        title: 'Essential docker run Flags',
        content: `* \`-e / --env\`: Passes environment variables into the container runtime.
* \`--restart\`: Defines auto-restart behavior on crash (\`always\`, \`on-failure\`, \`unless-stopped\`).
* \`--rm\`: Automatically deletes container when its process exits (great for one-off CLI tools or tests).
* \`--memory\`: Enforces hard RAM limits (e.g. \`--memory=512m\`).`,
        visualHighlight: 'containers',
      },
    ],
    exercise: {
      id: 'ex-04',
      title: 'Configure Environment & Restart Policy',
      description: 'Run a node container with custom environment variable `APP_ENV=production` and restart policy `always`.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Run node container with APP_ENV=production and --restart always',
          task: 'Run `docker run -d --name my-api -e APP_ENV=production --restart always node:22-alpine`',
          validator: (state) => {
            const c = Object.values(state.containers).find((c) => c.name === 'my-api');
            return Boolean(c && c.environment['APP_ENV'] === 'production' && c.restartPolicy === 'always');
          },
          hints: ['Use -e APP_ENV=production', 'Use --restart always', 'Specify image node:22-alpine'],
          solution: 'docker run -d --name my-api -e APP_ENV=production --restart always node:22-alpine',
        },
      ],
    },
    quiz: {
      id: 'quiz-04',
      title: 'Chapter 4 Quiz: docker run Flags',
      passingScore: 75,
      questions: [
        {
          id: 'q4-1',
          question: 'Why should sensitive database passwords preferably NOT be hardcoded in Dockerfiles?',
          options: [
            { id: 'a', text: 'Dockerfiles cannot accept text', isCorrect: false, explanation: 'Dockerfiles are text files.' },
            { id: 'b', text: 'Image layers are permanent and can be inspected by anyone who has access to the image', isCorrect: true, explanation: 'Correct! Hardcoded secrets in images remain visible in image layer history.' },
            { id: 'c', text: 'Passwords slow down container startup by 50%', isCorrect: false, explanation: 'There is no performance impact, but it is a critical security vulnerability.' },
          ],
          conceptExplanation: 'Secrets should be injected at runtime via environment variables or secret managers, never baked into image layers.',
        },
      ],
    },
  },
  {
    id: 'ch-05',
    slug: 'ports-and-publishing',
    order: 5,
    title: 'Ports & Port Publishing',
    tagline: 'Host Port vs Container Port Mapping & Network Address Translation',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    summary: 'Demystify port publishing (`-p host:container`). Learn how Docker bridges external traffic into isolated container namespaces.',
    learningObjectives: [
      'Understand the syntax of `-p HOST_PORT:CONTAINER_PORT`',
      'Learn why container ports are invisible to the host without `-p`',
      'Avoid host port collision errors',
    ],
    sections: [
      {
        id: 'sec-05-anatomy',
        title: 'Anatomy of `-p 8080:80`',
        content: `By default, containers exist inside an isolated private subnet. Their internal ports (e.g. port 80 for Nginx or 5432 for Postgres) cannot be reached directly from your browser or host network.\n\nThe \`-p\` flag instructs Docker to create a NAT port forward bridge:\n\n\`\`\`text\nBrowser -> http://localhost:8080 (Host Port)\n                │ (Docker NAT Forwarding)\n                ▼\n           Container Port 80 (Nginx)\n\`\`\``,
        visualHighlight: 'ports',
      },
    ],
    exercise: {
      id: 'ex-05',
      title: 'Publish Nginx on Port 8080',
      description: 'Run an nginx container exposed on host port 8080.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Publish nginx on host port 8080',
          task: 'Run `docker run -d --name web-server -p 8080:80 nginx:alpine`',
          validator: (state) => {
            const c = Object.values(state.containers).find((c) => c.name === 'web-server');
            return Boolean(c && c.ports.some((p) => p.hostPort === 8080 && p.containerPort === 80));
          },
          hints: ['Use -p 8080:80', 'Name it web-server'],
          solution: 'docker run -d --name web-server -p 8080:80 nginx:alpine',
        },
      ],
    },
    quiz: {
      id: 'quiz-05',
      title: 'Chapter 5 Quiz: Port Publishing',
      passingScore: 75,
      questions: [
        {
          id: 'q5-1',
          question: 'In the flag `-p 3000:80`, what does 3000 represent?',
          options: [
            { id: 'a', text: 'The container internal port', isCorrect: false, explanation: 'The second number (80) is the container internal port.' },
            { id: 'b', text: 'The host machine port accessible from your browser', isCorrect: true, explanation: 'Correct! The first number is the host port.' },
            { id: 'c', text: 'The maximum RAM in megabytes', isCorrect: false, explanation: 'Port numbers define network sockets.' },
          ],
          conceptExplanation: 'Syntax is always HOST_PORT : CONTAINER_PORT.',
        },
      ],
    },
  },
  {
    id: 'ch-06',
    slug: 'container-networking',
    order: 6,
    title: 'Container Networking & Embedded DNS',
    tagline: 'Custom Bridges, Service Discovery, and Why localhost Fails Between Containers',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    summary: 'Discover how containers communicate. Master custom bridge networks and Docker internal DNS resolution by container name.',
    learningObjectives: [
      'Understand why `localhost` inside container A cannot reach container B',
      'Create user-defined bridge networks with `docker network create`',
      'Use Docker automatic DNS resolution to connect microservices',
    ],
    sections: [
      {
        id: 'sec-06-localhost-trap',
        title: 'The `localhost` Trap',
        content: `A frequent beginner mistake is trying to make container \`frontend\` call \`http://localhost:5000\` to reach \`backend\`.\n\n**Why this fails:** Each container has its own isolated network namespace and loopback interface (\`127.0.0.1\`). Inside \`frontend\`, \`localhost\` refers strictly to \`frontend\` itself, not other containers or the host machine!`,
        visualHighlight: 'networks',
      },
      {
        id: 'sec-06-dns',
        title: 'User-Defined Bridge & Docker DNS',
        content: `When you create a custom bridge network:\n\`\`\`bash\ndocker network create app-net\n\`\`\`\nDocker activates an embedded DNS server (\`127.0.0.11\`). Containers attached to \`app-net\` can communicate simply using each other's container names (e.g. \`http://api:5000\`).`,
        visualHighlight: 'networks',
      },
    ],
    exercise: {
      id: 'ex-06',
      title: 'Connect Two Containers on Custom Network',
      description: 'Create a network named `app-net` and run a backend container attached to it.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Create network named app-net',
          task: 'Run `docker network create app-net`',
          validator: (state) => Boolean(state.networks['app-net']),
          hints: ['Use docker network create app-net'],
          solution: 'docker network create app-net',
        },
        {
          id: 'step-2',
          instruction: 'Run api container on app-net',
          task: 'Run `docker run -d --name api --network app-net node:22-alpine`',
          validator: (state) => {
            const c = Object.values(state.containers).find((c) => c.name === 'api');
            return Boolean(c && c.networks['app-net']);
          },
          hints: ['Use --network app-net', 'Use --name api', 'Specify node:22-alpine'],
          solution: 'docker run -d --name api --network app-net node:22-alpine',
        },
      ],
    },
    quiz: {
      id: 'quiz-06',
      title: 'Chapter 6 Quiz: Networking & DNS',
      passingScore: 75,
      questions: [
        {
          id: 'q6-1',
          question: 'How do containers on the same user-defined network discover each other?',
          options: [
            { id: 'a', text: 'By manually hardcoding dynamically assigned IP addresses', isCorrect: false, explanation: 'IPs change on container recreation.' },
            { id: 'b', text: 'Using Docker automatic DNS resolution via container name or service alias', isCorrect: true, explanation: 'Correct! Docker embedded DNS resolves container names directly to their IPs.' },
            { id: 'c', text: 'Through public internet domain registrars', isCorrect: false, explanation: 'Docker DNS operates purely internally inside the host.' },
          ],
          conceptExplanation: 'User-defined networks feature built-in DNS service discovery by container name.',
        },
      ],
    },
  },
  {
    id: 'ch-07',
    slug: 'volumes-and-persistence',
    order: 7,
    title: 'Volumes & Data Persistence',
    tagline: 'Named Volumes vs Bind Mounts & Ephemeral Storage',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    summary: 'Learn how to persist database data and file uploads beyond container lifecycles using Named Volumes and Host Bind Mounts.',
    learningObjectives: [
      'Understand the ephemeral nature of the container writable layer',
      'Create and attach Named Volumes with `docker volume create` and `-v`',
      'Compare Named Volumes vs Host Bind Mounts',
    ],
    sections: [
      {
        id: 'sec-07-ephemeral',
        title: 'Why Containers are Ephemeral',
        content: `Any file written inside a container lives in its ephemeral read-write layer. If the container is deleted (\`docker rm\`), all modified files and database records inside that layer are permanently destroyed!\n\nTo save persistent data, we use **Docker Volumes** or **Bind Mounts**.`,
        visualHighlight: 'volumes',
      },
    ],
    exercise: {
      id: 'ex-07',
      title: 'Create and Mount a Persistent Volume',
      description: 'Create a named volume `db-data` and mount it to a postgres database container.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Create volume named db-data',
          task: 'Run `docker volume create db-data`',
          validator: (state) => Boolean(state.volumes['db-data']),
          hints: ['Use docker volume create db-data'],
          solution: 'docker volume create db-data',
        },
        {
          id: 'step-2',
          instruction: 'Run postgres with db-data mounted to /var/lib/postgresql/data',
          task: 'Run `docker run -d --name db -v db-data:/var/lib/postgresql/data postgres:16-alpine`',
          validator: (state) => {
            const c = Object.values(state.containers).find((c) => c.name === 'db');
            return Boolean(c && c.mounts.some((m) => m.source === 'db-data'));
          },
          hints: ['Use -v db-data:/var/lib/postgresql/data', 'Name it db'],
          solution: 'docker run -d --name db -v db-data:/var/lib/postgresql/data postgres:16-alpine',
        },
      ],
    },
    quiz: {
      id: 'quiz-07',
      title: 'Chapter 7 Quiz: Volumes',
      passingScore: 75,
      questions: [
        {
          id: 'q7-1',
          question: 'What happens to data stored in a Named Volume when the mounting container is deleted with `docker rm`?',
          options: [
            { id: 'a', text: 'The volume and all its contents are automatically deleted', isCorrect: false, explanation: 'Volumes are independent of container lifecycles.' },
            { id: 'b', text: 'The data remains safely preserved on the host and can be attached to new containers', isCorrect: true, explanation: 'Correct! Volumes persist until explicitly removed with docker volume rm.' },
            { id: 'c', text: 'The data is uploaded to Docker Hub', isCorrect: false, explanation: 'Volumes stay local to the host engine.' },
          ],
          conceptExplanation: 'Volumes decouple data lifespan from container lifespan.',
        },
      ],
    },
  },
  {
    id: 'ch-08',
    slug: 'dockerfiles-and-build-cache',
    order: 8,
    title: 'Writing Dockerfiles & Build Cache',
    tagline: 'FROM, WORKDIR, COPY, RUN, CMD & Cache Optimization',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    summary: 'Write declarative Dockerfiles, understand instruction ordering, optimize layer caching, and build images with `docker build`.',
    learningObjectives: [
      'Master essential Dockerfile instructions: FROM, WORKDIR, COPY, RUN, EXPOSE, CMD',
      'Understand layer caching rules and cache invalidation',
      'Build custom images using `docker build -t myapp .`',
    ],
    sections: [
      {
        id: 'sec-08-instructions',
        title: 'Core Dockerfile Instructions',
        content: `* \`FROM node:22-alpine\`: Sets the base image blueprint.
* \`WORKDIR /app\`: Sets current directory for following commands.
* \`COPY package*.json ./\`: Copies dependency manifests.
* \`RUN npm install\`: Executes shell command during build time to create layer.
* \`COPY . .\`: Copies application source code.
* \`EXPOSE 3000\`: Documents intended container listening port.
* \`CMD ["npm", "start"]\`: Default process executed when container starts.`,
        visualHighlight: 'dockerfile',
      },
    ],
    exercise: {
      id: 'ex-08',
      title: 'Build a Custom Application Image',
      description: 'Build a custom application image tagged `myapp:1.0` from current directory context.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Build image with tag myapp:1.0',
          task: 'Run `docker build -t myapp:1.0 .` in the terminal.',
          validator: (state) => Boolean(state.images['myapp:1.0']),
          hints: ['Use docker build -t myapp:1.0 .', 'Do not forget the trailing dot for build context'],
          solution: 'docker build -t myapp:1.0 .',
        },
      ],
    },
    quiz: {
      id: 'quiz-08',
      title: 'Chapter 8 Quiz: Dockerfile & Caching',
      passingScore: 75,
      questions: [
        {
          id: 'q8-1',
          question: 'Why is `COPY package*.json ./` followed by `RUN npm install` placed BEFORE `COPY . .` in a Dockerfile?',
          options: [
            { id: 'a', text: 'To prevent npm from installing tests', isCorrect: false, explanation: 'Npm installs according to package.json.' },
            { id: 'b', text: 'To leverage Docker layer cache so npm install is skipped if dependencies haven’t changed', isCorrect: true, explanation: 'Correct! If source files change but package.json is unchanged, the heavy npm install layer is reused from cache.' },
            { id: 'c', text: 'Docker will throw a syntax error otherwise', isCorrect: false, explanation: 'It is valid syntax, but unoptimized.' },
          ],
          conceptExplanation: 'Order Dockerfile instructions from least frequently changing to most frequently changing to maximize cache hits.',
        },
      ],
    },
  },
  {
    id: 'ch-09',
    slug: 'docker-compose',
    order: 9,
    title: 'Docker Compose Multi-Container Orchestration',
    tagline: 'YAML Service Definitions, Dependencies & One-Command Environments',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    summary: 'Define multi-container applications (Frontend + Backend + DB) declaratively in `compose.yaml` and orchestrate them with `docker compose up`.',
    learningObjectives: [
      'Write multi-service Docker Compose YAML files',
      'Orchestrate full stacks with `docker compose up -d` and `docker compose down`',
      'Understand project-scoped default networks and volumes',
    ],
    sections: [
      {
        id: 'sec-09-why-compose',
        title: 'Why Docker Compose?',
        content: `Running 5 separate microservices with individual \`docker run\` commands requires manually setting networks, volume mounts, and port flags for each one.\n\n**Docker Compose** allows you to describe your entire multi-container architecture in a single declarative \`compose.yaml\` file and spin everything up with one command:\n\`\`\`bash\ndocker compose up -d\n\`\`\``,
        visualHighlight: 'compose',
      },
    ],
    exercise: {
      id: 'ex-09',
      title: 'Launch a Multi-Service Stack with Compose',
      description: 'Start a 3-tier microservice architecture using Docker Compose.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Spin up the full application stack in detached mode',
          task: 'Run `docker compose up -d`',
          validator: (state) => Object.values(state.containers).some((c) => c.labels['com.docker.compose.project']),
          hints: ['Use docker compose up -d'],
          solution: 'docker compose up -d',
        },
      ],
    },
    quiz: {
      id: 'quiz-09',
      title: 'Chapter 9 Quiz: Docker Compose',
      passingScore: 75,
      questions: [
        {
          id: 'q9-1',
          question: 'What network does Docker Compose create by default for a project?',
          options: [
            { id: 'a', text: 'No network; all containers use host mode', isCorrect: false, explanation: 'Compose isolates services by default.' },
            { id: 'b', text: 'A default project bridge network allowing all services to reach each other by service name', isCorrect: true, explanation: 'Correct! Compose creates a project-scoped network linking all declared services.' },
            { id: 'c', text: 'A public cloud overlay network', isCorrect: false, explanation: 'Compose creates a local bridge network.' },
          ],
          conceptExplanation: 'Compose automatically establishes a shared network for seamless inter-service communication.',
        },
      ],
    },
  },
  {
    id: 'ch-10',
    slug: 'debugging-and-troubleshooting',
    order: 10,
    title: 'Debugging & Troubleshooting Containers',
    tagline: 'Logs, Shell Exec, Exit Codes & Diagnostic Workflows',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    summary: 'Master container diagnosis using `docker logs`, `docker exec -it`, `docker inspect`, and exit code analysis.',
    learningObjectives: [
      'Diagnose crash loops and Exit Code 1 / 137 issues',
      'Inspect container environment and network interfaces via `docker exec`',
      'Troubleshoot port conflicts and network isolation',
    ],
    sections: [
      {
        id: 'sec-10-toolkit',
        title: 'The Troubleshooting Toolkit',
        content: `When a container fails:\n1. \`docker ps -a\`: Check exit code and status.\n2. \`docker logs <name>\`: Inspect stdout/stderr error stack traces.\n3. \`docker inspect <name>\`: Check environment variables, IP, and mount points.\n4. \`docker exec -it <name> sh\`: Step inside the running container to run curl/ping tests.`,
        visualHighlight: 'debugging',
      },
    ],
    exercise: {
      id: 'ex-10',
      title: 'Inspect Logs and Check Container Stats',
      description: 'Inspect the logs and live resource stats of an active container.',
      steps: [
        {
          id: 'step-1',
          instruction: 'Inspect logs of running web container',
          task: 'Run `docker logs web` or `docker stats`',
          validator: (state, lastCmd) => Boolean(lastCmd && (lastCmd.includes('logs') || lastCmd.includes('stats') || lastCmd.includes('inspect'))),
          hints: ['Use docker logs <container-name> or docker stats'],
          solution: 'docker logs web',
        },
      ],
    },
    quiz: {
      id: 'quiz-10',
      title: 'Chapter 10 Quiz: Container Debugging',
      passingScore: 75,
      questions: [
        {
          id: 'q10-1',
          question: 'What is the first command you should run when a container exits immediately after `docker run`?',
          options: [
            { id: 'a', text: 'docker build --no-cache', isCorrect: false, explanation: 'Rebuilding before checking errors is premature.' },
            { id: 'b', text: 'docker logs <container-name> to inspect application crash output', isCorrect: true, explanation: 'Correct! docker logs shows the exact error message or missing configuration causing the exit.' },
            { id: 'c', text: 'docker network rm', isCorrect: false, explanation: 'Network removal will not fix container crashes.' },
          ],
          conceptExplanation: 'docker logs reveals why the entrypoint process exited.',
        },
      ],
    },
  },
  {
    id: 'ch-k8s',
    slug: 'bridge-to-kubernetes',
    order: 11,
    title: 'Bridge to Kubernetes (K8s)',
    tagline: 'From Single Host Containers to Distributed Cluster Orchestration',
    difficulty: 'advanced',
    estimatedMinutes: 10,
    summary: 'Connect Docker concepts to Kubernetes primitives: Containers -> Pods, Compose Services -> Deployments, Port Mappings -> Services & Ingress.',
    learningObjectives: [
      'Understand why orchestration is needed beyond single-host Docker',
      'Map Docker concepts to Kubernetes equivalents (Pod, Deployment, Service, ConfigMap)',
      'Prepare for multi-node production deployment',
    ],
    sections: [
      {
        id: 'sec-k8s-mapping',
        title: 'Docker to Kubernetes Conceptual Rosetta Stone',
        content: `| Docker Concept | Kubernetes Equivalent | Purpose in Kubernetes |
| :--- | :--- | :--- |
| **Container** | **Pod (1+ containers)** | Smallest deployable unit sharing network namespace |
| **docker run / restart** | **Deployment & ReplicaSet** | Self-healing, declarative desired state & rolling updates |
| **Port Mapping (\`-p\`)** | **Service (ClusterIP/NodePort)** | Stable internal load balancer & DNS abstraction |
| **Custom Network** | **Cluster CNI (Calico/Flannel)** | Flat cross-node pod networking |
| **Named Volume** | **PersistentVolumeClaim (PVC)** | Storage provisioner decoupled from cluster nodes |
| **-e ENV=val** | **ConfigMap & Secret** | Externalized configuration & encrypted secrets |
| **Docker Compose** | **Helm Chart / K8s Manifests** | Multi-tier distributed application definition |`,
        visualHighlight: 'architecture',
      },
    ],
    quiz: {
      id: 'quiz-k8s',
      title: 'Kubernetes Bridge Quiz',
      passingScore: 75,
      questions: [
        {
          id: 'qk8s-1',
          question: 'What is the smallest deployable compute unit in Kubernetes?',
          options: [
            { id: 'a', text: 'Virtual Machine', isCorrect: false, explanation: 'Kubernetes operates on pods, not raw VMs.' },
            { id: 'b', text: 'Pod', isCorrect: true, explanation: 'Correct! A Pod encapsulates one or more co-located containers sharing storage and network IP.' },
            { id: 'c', text: 'Docker Daemon', isCorrect: false, explanation: 'The daemon is the underlying container runtime.' },
          ],
          conceptExplanation: 'Pods are the fundamental execution unit in Kubernetes.',
        },
      ],
    },
  },
];
