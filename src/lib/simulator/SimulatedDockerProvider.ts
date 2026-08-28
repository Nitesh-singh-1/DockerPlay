import {
  Container,
  DockerImage,
  DockerNetwork,
  DockerVolume,
  DockerState,
  CommandExecutionResult,
} from '@/types/docker';
import { ParsedCommand } from '@/types/parser';
import { DockerEngine, getDockerEngine } from './DockerEngine';
import { CommandParser } from '../parser/CommandParser';

export interface DockerProvider {
  getState(): DockerState;
  subscribe(listener: (state: DockerState) => void): () => void;
  executeCli(rawCommand: string): Promise<CommandExecutionResult>;
  listContainers(all?: boolean): Promise<Container[]>;
  stopContainer(nameOrId: string): Promise<void>;
  startContainer(nameOrId: string): Promise<void>;
  restartContainer(nameOrId: string): Promise<void>;
  removeContainer(nameOrId: string, force?: boolean): Promise<void>;
  listImages(): Promise<DockerImage[]>;
  pullImage(name: string): Promise<void>;
  listNetworks(): Promise<DockerNetwork[]>;
  listVolumes(): Promise<DockerVolume[]>;
  resetEnvironment(preset?: DockerState): Promise<void>;
}

export class SimulatedDockerProvider implements DockerProvider {
  private engine: DockerEngine;

  constructor(engine?: DockerEngine) {
    this.engine = engine || getDockerEngine();
  }

  public getState(): DockerState {
    return this.engine.getState();
  }

  public subscribe(listener: (state: DockerState) => void): () => void {
    return this.engine.subscribe(listener);
  }

  public async executeCli(rawCommand: string): Promise<CommandExecutionResult> {
    const parsed: ParsedCommand = CommandParser.parse(rawCommand);
    return this.engine.execute(parsed);
  }

  public async listContainers(all: boolean = false): Promise<Container[]> {
    const state = this.engine.getState();
    return Object.values(state.containers).filter(
      (c) => all || c.status === 'running' || c.status === 'restarting'
    );
  }

  public async stopContainer(nameOrId: string): Promise<void> {
    await this.executeCli(`docker stop ${nameOrId}`);
  }

  public async startContainer(nameOrId: string): Promise<void> {
    await this.executeCli(`docker start ${nameOrId}`);
  }

  public async restartContainer(nameOrId: string): Promise<void> {
    await this.executeCli(`docker restart ${nameOrId}`);
  }

  public async removeContainer(nameOrId: string, force: boolean = false): Promise<void> {
    await this.executeCli(`docker rm ${force ? '-f ' : ''}${nameOrId}`);
  }

  public async listImages(): Promise<DockerImage[]> {
    return Object.values(this.engine.getState().images);
  }

  public async pullImage(name: string): Promise<void> {
    await this.executeCli(`docker pull ${name}`);
  }

  public async listNetworks(): Promise<DockerNetwork[]> {
    return Object.values(this.engine.getState().networks);
  }

  public async listVolumes(): Promise<DockerVolume[]> {
    return Object.values(this.engine.getState().volumes);
  }

  public async resetEnvironment(preset?: DockerState): Promise<void> {
    this.engine.reset(preset);
  }
}

// Global default provider
let globalProviderInstance: SimulatedDockerProvider | null = null;

export function getDockerProvider(): DockerProvider {
  if (!globalProviderInstance) {
    globalProviderInstance = new SimulatedDockerProvider();
  }
  return globalProviderInstance;
}
