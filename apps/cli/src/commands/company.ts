import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const companyCommand = new Command('company')
  .description('Manage news companies');

companyCommand
  .command('add <name>')
  .description('Add a new company')
  .option('-d, --description <text>', 'Company description')
  .option('-c, --categories <slugs>', 'Comma-separated category slugs')
  .action(async (name: string, options: { description?: string; categories?: string }) => {
    const spinner = ora('Creating company...').start();
    try {
      // TODO: Create company in DB
      spinner.succeed(chalk.green(`Company "${name}" created successfully`));
      if (options.categories) {
        console.log(chalk.dim(`  Categories: ${options.categories}`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to create company'));
      console.error(error);
      process.exit(1);
    }
  });

companyCommand
  .command('list')
  .description('List all companies')
  .action(async () => {
    const spinner = ora('Fetching companies...').start();
    try {
      // TODO: Fetch from DB
      spinner.stop();
      console.log(chalk.bold('\n  Companies\n'));
      console.log(chalk.dim('  No companies found. Create one with: jaurnalist company add <name>'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch companies'));
      process.exit(1);
    }
  });

companyCommand
  .command('remove <slug>')
  .description('Remove a company')
  .action(async (slug: string) => {
    const spinner = ora(`Removing company "${slug}"...`).start();
    try {
      // TODO: Delete from DB
      spinner.succeed(chalk.green(`Company "${slug}" removed`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to remove company'));
      process.exit(1);
    }
  });
