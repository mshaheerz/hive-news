import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const CONFIG_DIR = path.join(os.homedir(), '.jaurnalist');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.toml');

export interface JaurnalistConfig {
  [key: string]: string;
}

/**
 * Loads the config file and returns a parsed object.
 * Uses simple key=value parsing (no TOML library needed).
 */
export function loadConfig(): JaurnalistConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const config: JaurnalistConfig = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    config[key] = value;
  }

  return config;
}

/**
 * Saves the config object to the config file.
 */
export function saveConfig(config: JaurnalistConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const lines: string[] = [];
  for (const [key, value] of Object.entries(config)) {
    lines.push(`${key} = "${value}"`);
  }

  fs.writeFileSync(CONFIG_FILE, lines.join('\n') + '\n', 'utf-8');
}

/**
 * Returns DATABASE_URL from config file or environment variable.
 * Environment variable takes precedence.
 */
export function getDbUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const config = loadConfig();
  return config.DATABASE_URL || config.database_url;
}

/**
 * Returns REDIS_URL from config file or environment variable.
 * Environment variable takes precedence.
 */
export function getRedisUrl(): string | undefined {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const config = loadConfig();
  return config.REDIS_URL || config.redis_url;
}
