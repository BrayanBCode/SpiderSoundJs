#!/usr/bin/env bun
import { spawn } from 'child_process';

console.log('Starting SpiderSoundJs...');

// Start NodeLink server
const nodelink = spawn('bun', ['run', '--cwd', 'apps/NodeLink', 'start:bun'], {
  stdio: 'inherit',
  detached: false
});

// Wait a bit for NodeLink to start
await new Promise(resolve => setTimeout(resolve, 3000));

// Start the bot
const bot = spawn('bun', ['run', '--cwd', 'apps/bot', 'dev'], {
  stdio: 'inherit',
  detached: false
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  nodelink.kill();
  bot.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  nodelink.kill();
  bot.kill();
  process.exit(0);
});

// Keep the process running
await new Promise(() => {});