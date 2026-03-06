import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const configCommand = new Command('config')
  .description('Manage configuration settings');

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action(async (key: string, value: string) => {
    const spinner = ora(`Setting ${key}...`).start();
    try {
      // TODO: Save to DB settings table via @jaurnalist/db
      spinner.succeed(chalk.green(`Set ${chalk.bold(key)} = ${chalk.cyan(value)}`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to set ${key}`));
      console.error(error);
      process.exit(1);
    }
  });

configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action(async (key: string) => {
    const spinner = ora(`Reading ${key}...`).start();
    try {
      // TODO: Read from DB settings table via @jaurnalist/db
      spinner.stop();
      const value = undefined; // TODO: Replace with actual DB lookup
      if (value) {
        console.log(`  ${chalk.bold(key)} = ${chalk.cyan(value)}`);
      } else {
        console.log(chalk.dim(`  ${key} is not set`));
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to read ${key}`));
      console.error(error);
      process.exit(1);
    }
  });

configCommand
  .command('list')
  .description('List all configuration settings')
  .action(async () => {
    const spinner = ora('Fetching settings...').start();
    try {
      // TODO: Fetch all settings from DB via @jaurnalist/db
      spinner.stop();
      console.log(chalk.bold('\n  Configuration\n'));
      console.log(chalk.dim('  No settings found. Set one with: jaurnalist config set <key> <value>'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch settings'));
      process.exit(1);
    }
  });
