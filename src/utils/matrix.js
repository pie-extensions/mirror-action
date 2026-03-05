import * as semver from 'semver';

/**
 * Resolve PHP versions for a given extension version based on
 * php-version-constraints. First matching constraint wins.
 * Falls back to the default build.php-versions if no constraint matches.
 *
 * @param {string} extVersion - Extension version (tag), e.g. "10.1.0" or "v1.2.3"
 * @param {object} buildConfig - The build section of .pie-mirror.json
 * @returns {string[]} PHP versions to build for
 */
export function resolvePhpVersions(extVersion, buildConfig) {
    const constraints = buildConfig['php-version-constraints'] ?? [];
    const coerced = semver.coerce(extVersion);

    if (coerced && constraints.length > 0) {
        for (const constraint of constraints) {
            if (semver.satisfies(coerced, constraint['ext-versions'])) {
                return constraint['php-versions'];
            }
        }
    }

    return buildConfig['php-versions'];
}

/**
 * Resolve the full build matrix for a given extension version.
 *
 * @param {string} extVersion - Extension version (tag)
 * @param {object} config - Full .pie-mirror.json config
 * @returns {{ enabled: boolean, matrix: object, buildPath: string }}
 */
export function resolveMatrix(extVersion, config) {
    const build = config.build;
    const enabled = build.enabled ?? false;

    if (!enabled) {
        return { enabled: false, matrix: null, buildPath: null };
    }

    const phpVersions = resolvePhpVersions(extVersion, build);

    const matrix = {
        os: build.os,
        arch: build.arches,
        php: phpVersions,
        zts: build.zts,
    };

    const rawBuildPath = build['build-path'] ?? '.';
    const sourceDir = config.source_dir ?? 'src/';
    let buildPath;
    if (rawBuildPath === '.' || !rawBuildPath) {
        buildPath = sourceDir.replace(/\/$/, '');
    } else {
        buildPath = `${sourceDir.replace(/\/$/, '')}/${rawBuildPath}`;
    }

    return { enabled: true, matrix, buildPath };
}
