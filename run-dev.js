import { spawn } from 'child_process';

// Extract --port and --host flags if passed by AI Studio build runner
const args = process.argv.slice(2);
let port = process.env.PORT || '3000';
let host = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = args[i + 1];
  }
  if (args[i] === '--host' && args[i + 1]) {
    host = args[i + 1];
  }
}

process.env.PORT = port;
process.env.HOST = host;

// Spawn tsx server.ts with environment variables
const child = spawn('npx', ['tsx', 'server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port, HOST: host },
});

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
