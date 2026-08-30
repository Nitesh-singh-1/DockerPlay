import { CommandParser } from '../src/lib/parser/CommandParser';
import { DockerEngine } from '../src/lib/simulator/DockerEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✔ Passed: ${msg}`);
}

console.log('=== RUNNING DOCKER SIMULATOR AUDIT VERIFICATION ===\n');

const engine = new DockerEngine();

// Test 1: Volume parsing with path destination
console.log('--- Test 1: Volume parsing with path destination ---');
const cmd1 = CommandParser.parse('docker run -d --name db -v dbdata:/var/lib/postgresql/data postgres:16-alpine');
assert(cmd1.isValid === true, 'Command 1 should be valid');
assert(cmd1.flags.name === 'db', 'Container name should be "db"');
assert(cmd1.positionalArgs[0] === 'postgres:16-alpine', `Image should be "postgres:16-alpine", got "${cmd1.positionalArgs[0]}"`);

const res1 = engine.execute(cmd1);
assert(res1.exitCode === 0, `Execution should succeed: ${res1.stderr}`);
const dbContainer = engine.findContainer('db');
assert(dbContainer !== undefined, 'Container "db" should exist');
assert(dbContainer?.image === 'postgres:16-alpine', `Image in state should be postgres:16-alpine, got ${dbContainer?.image}`);
assert(dbContainer?.mounts[0]?.source === 'dbdata', 'Volume source should be "dbdata"');
assert(dbContainer?.mounts[0]?.destination === '/var/lib/postgresql/data', 'Volume destination should be "/var/lib/postgresql/data"');
assert(engine.getState().volumes['dbdata'] !== undefined, 'Named volume "dbdata" should be registered in state.volumes');

// Test 2: Invalid volume spec (-v dbdata without destination)
console.log('\n--- Test 2: Invalid volume spec (-v dbdata without destination) ---');
const cmd2 = CommandParser.parse('docker run -v dbdata nginx');
assert(cmd2.isValid === false, 'Command 2 should be rejected as invalid syntax');
assert(cmd2.validationError?.includes('invalid volume specification') === true, 'Should provide educational volume syntax error');

// Test 3: Malformed triple dash flag (---name)
console.log('\n--- Test 3: Malformed triple dash flag (---name) ---');
const cmd3 = CommandParser.parse('docker run ---name db nginx');
assert(cmd3.isValid === false, 'Command 3 should be rejected');
assert(cmd3.validationError?.includes('unknown flag: \'---name\'') === true, 'Should detect unknown flag ---name');

// Test 4: Malformed colon port flag (-p:5001:80)
console.log('\n--- Test 4: Malformed colon port flag (-p:5001:80) ---');
const cmd4 = CommandParser.parse('docker run -p:5001:80 nginx');
assert(cmd4.isValid === false, 'Command 4 should be rejected');
assert(cmd4.validationError?.includes('-p 5001:80') === true, 'Should suggest correct -p flag syntax');

// Test 5: docker rm -f db (Volume persistence check)
console.log('\n--- Test 5: docker rm -f db and volume persistence ---');
const cmd5 = CommandParser.parse('docker rm -f db');
assert(cmd5.isValid === true, 'docker rm -f db should be valid');
assert(cmd5.flags.force === true, 'Force flag should be parsed');
assert(cmd5.positionalArgs[0] === 'db', 'Target should be "db"');

const res5 = engine.execute(cmd5);
assert(res5.exitCode === 0, `docker rm -f db should succeed: ${res5.stderr}`);
assert(engine.findContainer('db') === undefined, 'Container "db" should be deleted');
assert(engine.getState().volumes['dbdata'] !== undefined, 'Volume "dbdata" MUST STILL PERSIST in state.volumes after container deletion!');

// Test 6: docker create
console.log('\n--- Test 6: docker create ---');
const cmd6 = CommandParser.parse('docker create --name web-created -p 8080:80 nginx:alpine');
assert(cmd6.isValid === true, 'docker create should be valid');
const res6 = engine.execute(cmd6);
assert(res6.exitCode === 0, 'docker create should succeed');
const createdC = engine.findContainer('web-created');
assert(createdC?.status === 'created', `Status should be "created", got "${createdC?.status}"`);

// Test 7: Network DNS resolution
console.log('\n--- Test 7: Network DNS resolution ---');
const netCreateCmd = CommandParser.parse('docker network create app-net');
engine.execute(netCreateCmd);
assert(engine.getState().networks['app-net'] !== undefined, 'app-net network should exist');

const runApi = CommandParser.parse('docker run -d --name api --network app-net node:22-alpine');
const runDb = CommandParser.parse('docker run -d --name database --network app-net postgres:16-alpine');
engine.execute(runApi);
engine.execute(runDb);

const pingDbCmd = CommandParser.parse('docker exec api ping database');
const pingRes = engine.execute(pingDbCmd);
assert(pingRes.exitCode === 0, `Ping database from api should succeed: ${pingRes.stderr}`);
assert(pingRes.stdout.includes('PING database'), 'Ping stdout should show DNS resolution');

// Test 8: docker volume inspect
console.log('\n--- Test 8: docker volume inspect ---');
const volInspectCmd = CommandParser.parse('docker volume inspect dbdata');
const volInspectRes = engine.execute(volInspectCmd);
assert(volInspectRes.exitCode === 0, 'Volume inspect should succeed');
assert(volInspectRes.stdout.includes('"Name": "dbdata"'), 'Volume inspect stdout should contain Name: dbdata');

// Test 9: docker network inspect
console.log('\n--- Test 9: docker network inspect ---');
const netInspectCmd = CommandParser.parse('docker network inspect app-net');
const netInspectRes = engine.execute(netInspectCmd);
assert(netInspectRes.exitCode === 0, 'Network inspect should succeed');
assert(netInspectRes.stdout.includes('"Name": "app-net"'), 'Network inspect should contain app-net');

// Test 10: Docker Compose lifecycle (docker compose up -d, ps, down)
console.log('\n--- Test 10: Docker Compose lifecycle ---');
const composeUpCmd = CommandParser.parse('docker compose up -d');
assert(composeUpCmd.isValid === true, `docker compose up -d should be valid: ${composeUpCmd.validationError}`);
assert(composeUpCmd.command === 'up', `Command should be "up", got "${composeUpCmd.command}"`);
assert(composeUpCmd.flags.detach === true, 'Flag detach (-d) should be true');

const composeUpRes = engine.execute(composeUpCmd);
assert(composeUpRes.exitCode === 0, `Compose up execution should succeed: ${composeUpRes.stderr}`);
assert(composeUpRes.stdout.includes('Created'), 'Compose up should report network/container creation');
assert(Object.values(engine.getState().containers).some(c => c.name.includes('frontend')), 'Frontend container should exist');

const composePsCmd = CommandParser.parse('docker compose ps');
assert(composePsCmd.isValid === true, 'docker compose ps should be valid');
const composePsRes = engine.execute(composePsCmd);
assert(composePsRes.exitCode === 0, 'docker compose ps should succeed');
assert(composePsRes.stdout.includes('dockerplay-frontend-1'), 'compose ps should list frontend service');

const composeDownCmd = CommandParser.parse('docker compose down');
assert(composeDownCmd.isValid === true, 'docker compose down should be valid');
const composeDownRes = engine.execute(composeDownCmd);
assert(composeDownRes.exitCode === 0, 'docker compose down should succeed');

console.log('\n🎉 ALL 10 CRITICAL AUDIT, SIMULATOR & COMPOSE TESTS PASSED PERFECTLY!');

