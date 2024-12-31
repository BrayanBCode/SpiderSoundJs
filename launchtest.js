import { spawn } from 'child_process';

const command = 'cmd.exe';
const args = ['/c', 'start cmd.exe /k docker-compose up --build"'];

const process = spawn(command, args, { shell: true, stdio: 'inherit' });

process.on('close', (code) => {
  console.log(`Proceso terminado con código ${code}`);
});

process.on('error', (err) => {
  console.error('Error al ejecutar el comando:', err);
});