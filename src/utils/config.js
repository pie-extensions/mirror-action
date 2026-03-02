import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const CONFIG_PATH = '.pie-mirror.yml';

/**
 * Read and validate .pie-mirror.yml from the repo root.
 * Returns the parsed config object with defaults applied.
 */
export function readConfig(configPath = CONFIG_PATH) {
    const raw = readFileSync(configPath, 'utf-8');
    const config = yaml.load(raw);

    if (!config?.upstream?.repo) {
        throw new Error('.pie-mirror.yml: upstream.repo is required');
    }
    if (!config?.upstream?.type) {
        throw new Error('.pie-mirror.yml: upstream.type is required');
    }
    if (!config?.php_ext_name) {
        throw new Error('.pie-mirror.yml: php_ext_name is required');
    }

    // Apply defaults
    config.source_dir = config.source_dir || 'src/';
    config.upstream.type = config.upstream.type || 'github';
    config.sync = config.sync || {};
    config.sync.prereleases = config.sync.prereleases ?? false;
    config.sync['initial-versions'] = config.sync['initial-versions'] ?? 5;
    config.sync['exclude-tags'] = config.sync['exclude-tags'] ?? [];

    return config;
}
