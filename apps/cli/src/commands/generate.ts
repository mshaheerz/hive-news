import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const generateCommand = new Command('generate')
  .description('Generate news articles using AI reporters')
  .option('--company <slug>', 'Company slug to generate for')
  .option('--category <slug>', 'Category slug to filter by')
  .option('--count <n>', 'Number of articles to generate', '1')
  .action(async (options: { company?: string; category?: string; count: string }) => {
    const count = parseInt(options.count, 10);

    if (isNaN(count) || count < 1) {
      console.error(chalk.red('Error: --count must be a positive number'));
      process.exit(1);
    }

    console.log(chalk.bold('\n  Article Generation\n'));

    if (options.company) {
      console.log(chalk.dim(`  Company: ${options.company}`));
    }
    if (options.category) {
      console.log(chalk.dim(`  Category: ${options.category}`));
    }
    console.log(chalk.dim(`  Count: ${count}\n`));

    const spinner = ora(`Generating ${count} article${count > 1 ? 's' : ''}...`).start();

    try {
      // TODO: Generate articles via @jaurnalist/ai
      spinner.succeed(chalk.green(`Generated ${count} article${count > 1 ? 's' : ''} successfully`));

      console.log(chalk.bold('\n  Generated Articles\n'));
      // TODO: Print actual generated article titles
      for (let i = 1; i <= count; i++) {
        console.log(chalk.white(`  ${i}. `) + chalk.cyan('(Placeholder article title)'));
      }
      console.log('');
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate articles'));
      console.error(error);
      process.exit(1);
    }
  });
