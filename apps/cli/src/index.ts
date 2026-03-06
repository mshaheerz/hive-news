#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init';
import { registerStartCommand } from './commands/start';
import { registerCompanyCommand } from './commands/company';
import { registerReporterCommand } from './commands/reporter';
import { registerGenerateCommand } from './commands/generate';
import { registerConfigCommand } from './commands/config';
import { registerStatusCommand } from './commands/status';

const program = new Command();

program
  .name('jaurnalist')
  .description('AI-powered news platform')
  .version('0.1.0');

registerInitCommand(program);
registerStartCommand(program);
registerCompanyCommand(program);
registerReporterCommand(program);
registerGenerateCommand(program);
registerConfigCommand(program);
registerStatusCommand(program);

program.parse(process.argv);
