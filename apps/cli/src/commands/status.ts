import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

interface StatusInfo {
  dbConnected: boolean;
  companiesCount: number;
  reportersCount: number;
  articlesCount: number;
  workflowMode: string;
}

export const statusCommand = new Command('status')
  .description('Show system status')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    const spinner = ora('Checking status...').start();

    try {
      // TODO: Gather status from DB via @jaurnalist/db
      const status: StatusInfo = {
        dbConnected: false,
        companiesCount: 0,
        reportersCount: 0,
        articlesCount: 0,
        workflowMode: 'unknown',
      };

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      console.log(chalk.bold('\n  Jaurnalist Status\n'));

      // DB connection
      const dbStatus = status.dbConnected
        ? chalk.green('Connected')
        : chalk.red('Disconnected');
      console.log(`  ${chalk.dim('Database:')}       ${dbStatus}`);

      // Companies
      console.log(`  ${chalk.dim('Companies:')}      ${chalk.cyan(String(status.companiesCount))}`);

      // Reporters
      console.log(`  ${chalk.dim('Reporters:')}      ${chalk.cyan(String(status.reportersCount))}`);

      // Articles
      console.log(`  ${chalk.dim('Articles:')}       ${chalk.cyan(String(status.articlesCount))}`);

      // Workflow mode
      console.log(`  ${chalk.dim('Workflow Mode:')}  ${chalk.yellow(status.workflowMode)}`);

      console.log('');
    } catch (error) {
      spinner.fail(chalk.red('Failed to check status'));
      console.error(error);
      process.exit(1);
    }
  });
