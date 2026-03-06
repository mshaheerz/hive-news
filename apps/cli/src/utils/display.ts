import chalk from 'chalk';

/**
 * Prints a formatted table with headers and rows.
 */
export function printTable(headers: string[], rows: string[][]): void {
  if (headers.length === 0) return;

  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const maxDataWidth = rows.reduce((max, row) => {
      const cellWidth = (row[i] || '').length;
      return cellWidth > max ? cellWidth : max;
    }, 0);
    return Math.max(h.length, maxDataWidth);
  });

  // Print header
  const headerRow = headers
    .map((h, i) => chalk.bold(h.padEnd(colWidths[i])))
    .join('  ');
  console.log(`  ${headerRow}`);

  // Print separator
  const separator = colWidths.map((w) => chalk.dim('-'.repeat(w))).join('  ');
  console.log(`  ${separator}`);

  // Print rows
  if (rows.length === 0) {
    console.log(chalk.dim('  (no data)'));
    return;
  }

  for (const row of rows) {
    const formattedRow = headers
      .map((_, i) => (row[i] || '').padEnd(colWidths[i]))
      .join('  ');
    console.log(`  ${formattedRow}`);
  }
}

/**
 * Prints a success message.
 */
export function printSuccess(msg: string): void {
  console.log(chalk.green(`  ✓ ${msg}`));
}

/**
 * Prints an error message.
 */
export function printError(msg: string): void {
  console.error(chalk.red(`  ✗ ${msg}`));
}

/**
 * Prints a warning message.
 */
export function printWarning(msg: string): void {
  console.log(chalk.yellow(`  ⚠ ${msg}`));
}

/**
 * Formats a date as a relative time string.
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 5) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}
