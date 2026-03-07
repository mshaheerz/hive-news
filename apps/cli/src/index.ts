#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init';
import { registerStartCommand } from './commands/start';
import { companyCommand } from './commands/company';
import { reporterCommand } from './commands/reporter';
import { generateCommand } from './commands/generate';
import { configCommand } from './commands/config';
import { statusCommand } from './commands/status';

const program = new Command();

program
  .name('jaurnalist')
  .description('AI-powered news platform')
  .version('0.1.0');

registerInitCommand(program);
registerStartCommand(program);
program.addCommand(companyCommand);
program.addCommand(reporterCommand);
program.addCommand(generateCommand);
program.addCommand(configCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
