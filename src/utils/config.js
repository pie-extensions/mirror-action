import { readFileSync } from 'fs';

const CONFIG_PATH = '.pie-mirror.json';

/**
 * Read and validate .pie-mirror.json from the repo root.
 * Returns the parsed config object with defaults applied.
 */
export function readConfig(configPath = CONFIG_PATH) {
    const raw = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    if (!config?.upstream?.repo) {
        throw new Error('.pie-mirror.json: upstream.repo is required');
    }
    if (!config?.upstream?.type) {
        throw new Error('.pie-mirror.json: upstream.type is required');
    }
    if (!config?.php_ext_name) {
        throw new Error('.pie-mirror.json: php_ext_name is required');
    }

    // Apply defaults
    config.source_dir = config.source_dir || 'src/';
    config.upstream.type = config.upstream.type || 'github';
    config.sync = config.sync || {};
    config.sync.prereleases = config.sync.prereleases ?? false;
    config.sync['initial-versions'] = config.sync['initial-versions'] ?? 5;
    config.sync['exclude-tags'] = config.sync['exclude-tags'] ?? [];

    // Hook defaults and validation
    config.hooks = config.hooks || {};
    config.hooks['post-extract'] = config.hooks['post-extract'] ?? [];

    if (!Array.isArray(config.hooks['post-extract'])) {
        throw new Error('.pie-mirror.json: hooks.post-extract must be an array');
    }
    for (const [i, entry] of config.hooks['post-extract'].entries()) {
        if (typeof entry !== 'string') {
            throw new Error(
                `.pie-mirror.json: hooks.post-extract[${i}] must be a string, got ${typeof entry}`
            );
        }
        if (entry.trim() === '') {
            throw new Error(
                `.pie-mirror.json: hooks.post-extract[${i}] must not be empty`
            );
        }
    }

    // Build config defaults
    config.build = config.build || {};
    config.build.enabled = config.build.enabled ?? false;
    config.build.os = config.build.os ?? ['linux', 'darwin'];
    config.build.arches = config.build.arches ?? ['x86_64', 'arm64'];
    config.build['php-versions'] = config.build['php-versions'] ?? ['8.2', '8.3', '8.4', '8.5'];
    config.build.zts = config.build.zts ?? ['nts', 'ts'];

    return config;
}
