import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const reporterCommand = new Command('reporter')
  .description('Manage AI reporters');

reporterCommand
  .command('add <name>')
  .description('Add a new reporter')
  .option('--company <slug>', 'Company slug to assign reporter to')
  .option('--provider <provider>', 'AI provider (e.g. openai, anthropic)')
  .option('--model <model>', 'AI model to use')
  .option('--role <role>', 'Reporter role (e.g. writer, editor)')
  .option('--categories <slugs>', 'Comma-separated category slugs')
  .option('--persona <text>', 'Reporter persona description')
  .action(async (name: string, options: {
    company?: string;
    provider?: string;
    model?: string;
    role?: string;
    categories?: string;
    persona?: string;
  }) => {
    const spinner = ora('Creating reporter...').start();
    try {
      // TODO: Create reporter in DB via @jaurnalist/db
      spinner.succeed(chalk.green(`Reporter "${name}" created successfully`));
      if (options.company) {
        console.log(chalk.dim(`  Company: ${options.company}`));
      }
      if (options.provider && options.model) {
        console.log(chalk.dim(`  Model: ${options.provider}/${options.model}`));
      }
      if (options.role) {
        console.log(chalk.dim(`  Role: ${options.role}`));
      }
      if (options.categories) {
        console.log(chalk.dim(`  Categories: ${options.categories}`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to create reporter'));
      console.error(error);
      process.exit(1);
    }
  });

reporterCommand
  .command('list')
  .description('List all reporters')
  .option('--company <slug>', 'Filter by company slug')
  .action(async (options: { company?: string }) => {
    const spinner = ora('Fetching reporters...').start();
    try {
      // TODO: Fetch from DB, filter by company if provided
      spinner.stop();
      console.log(chalk.bold('\n  Reporters\n'));
      if (options.company) {
        console.log(chalk.dim(`  Filtered by company: ${options.company}`));
      }
      console.log(chalk.dim('  No reporters found. Create one with: jaurnalist reporter add <name>'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch reporters'));
      process.exit(1);
    }
  });

reporterCommand
  .command('remove <id>')
  .description('Remove a reporter')
  .action(async (id: string) => {
    const spinner = ora(`Removing reporter "${id}"...`).start();
    try {
      // TODO: Delete from DB
      spinner.succeed(chalk.green(`Reporter "${id}" removed`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to remove reporter'));
      process.exit(1);
    }
  });
