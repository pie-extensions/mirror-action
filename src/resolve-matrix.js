import * as core from '@actions/core';
import { readConfig } from './utils/config.js';
import { resolveMatrix } from './utils/matrix.js';

/**
 * Resolve the build matrix for a given release tag.
 * Sets outputs: enabled, matrix, build-path, release-tag
 */
export async function runResolveMatrix() {
    const releaseTag = core.getInput('release-tag', { required: true });

    const config = readConfig();
    const result = resolveMatrix(releaseTag, config);

    core.setOutput('enabled', String(result.enabled));
    core.setOutput('release-tag', releaseTag);

    if (result.enabled) {
        core.setOutput('matrix', JSON.stringify(result.matrix));
        core.setOutput('build-path', result.buildPath);
        core.info(`Build matrix resolved for ${releaseTag}: ${JSON.stringify(result.matrix)}`);
    } else {
        core.info('Build is not enabled for this extension');
    }
}
