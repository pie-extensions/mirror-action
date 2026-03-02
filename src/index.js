import * as core from '@actions/core';
import { runSync } from './sync.js';
import { runValidate } from './validate.js';

async function main() {
    const mode = core.getInput('mode', { required: true });
    const token = core.getInput('github-token', { required: true });

    switch (mode) {
        case 'sync':
            await runSync({ token });
            break;
        case 'validate':
            await runValidate();
            break;
        default:
            core.setFailed(`Unknown mode: "${mode}". Valid modes: sync, validate`);
    }
}

main().catch(err => {
    core.setFailed(err.message);
});
