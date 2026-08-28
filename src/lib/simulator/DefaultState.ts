import { DockerState } from '@/types/docker';
import { DEFAULT_IMAGES } from './DefaultImages';

export function createInitialDockerState(): DockerState {
  return {
    images: {
      'nginx:latest': { ...DEFAULT_IMAGES['nginx:latest'] },
      'node:22-alpine': { ...DEFAULT_IMAGES['node:22-alpine'] },
    },
    containers: {},
    networks: {
      bridge: {
        id: 'bridge-net-001',
        name: 'bridge',
        driver: 'bridge',
        subnet: '172.17.0.0/16',
        gateway: '172.17.0.1',
        internal: false,
        containers: [],
      },
      host: {
        id: 'host-net-002',
        name: 'host',
        driver: 'host',
        subnet: '127.0.0.0/8',
        gateway: '127.0.0.1',
        internal: false,
        containers: [],
      },
      none: {
        id: 'none-net-003',
        name: 'none',
        driver: 'none',
        subnet: '',
        gateway: '',
        internal: true,
        containers: [],
      },
    },
    volumes: {},
    events: [
      {
        id: 'evt-init',
        timestamp: Date.now() - 1000 * 60 * 5,
        type: 'daemon',
        action: 'start',
        actorId: 'docker-daemon',
        actorName: 'dockerd',
        attributes: {
          version: '27.1.1',
          os: 'linux/amd64',
          simulation: 'true',
        },
      },
    ],
    composeProjects: {},
  };
}
