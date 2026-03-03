# pie-extensions/mirror-action

## What this action does

This is a GitHub Action that handles syncing PHP extension source code from upstream repos into PIE-compatible mirror repos. It's called by each mirror repo's `sync.yml` workflow (dispatched by `pie-extensions/core`).

## Modes

### `sync`

Detects all upstream releases newer than the current mirror version and syncs them in order (oldest first).

For each new version:
1. Downloads source tarball from upstream
2. Extracts to `src/` (replacing previous contents)
3. Runs post-extract hooks (if configured in `.pie-mirror.yml`)
4. Updates `composer.json` version
5. Commits, tags, and pushes to `main`
6. Creates a GitHub Release

**Initial sync:** When `composer.json` version is `0.0.0` (freshly created mirror), only the last N versions are synced (default 5, configurable via `sync.initial-versions` in `.pie-mirror.yml`).

### `validate`

Checks that the mirror repo is PIE-compliant:
- `.pie-mirror.yml` has required fields
- `composer.json` has `type: "php-ext"`, `php-ext.extension-name`, `version`
- Source directory exists

## Inputs

| Input          | Required | Default | Description                            |
|----------------|----------|---------|----------------------------------------|
| `mode`         | yes      | —       | `sync` or `validate`                   |
| `github-token` | yes      | —       | Token with `contents: write`           |
| `max-versions` | no       | `0`     | Limit versions per run (0 = unlimited) |
| `dry-run`      | no       | `false` | Log without making changes             |

## Outputs

| Output              | Description                          |
|---------------------|--------------------------------------|
| `synced-versions`   | JSON array of synced version strings |
| `latest-version`    | Highest version synced (or empty)    |
| `validation-passed` | `"true"` / `"false"` (validate mode) |

## Configuration (`.pie-mirror.yml`)

```yaml
upstream:
  repo: "phpredis/phpredis"     # Required
  type: "github"                # Required
php_ext_name: "redis"           # Required
source_dir: "src/"              # Optional, default: "src/"
sync:
  prereleases: false            # Optional, default: false
  initial-versions: 5           # Optional, default: 5
  exclude-tags: []              # Optional, regex patterns to skip
hooks:
  post-extract:                 # Optional, commands to run after source extraction
    - "cp -r deps/ src/"
    - "node .pie-scripts/fix.js"
```

### Post-extract hooks

Commands listed under `hooks.post-extract` run after the upstream tarball is extracted but before `composer.json` is updated and the commit is created. Each entry is a shell command string executed via `sh -c`. To run a script file, write the full invocation (e.g., `node script.js` or `bash script.sh`).

Environment variables available to hook commands:
- `PIE_SYNC_TAG` — upstream tag being synced (e.g., `v4.29.3`)
- `PIE_SYNC_VERSION` — normalized semver version (e.g., `4.29.3`)
- `PIE_SOURCE_DIR` — configured source directory (e.g., `src/`)

## Local development

```bash
npm install
npm test                        # run tests
npm run build                   # bundle with ncc to dist/
```

## Key files

```
action.yml          — action definition
src/
  index.js          — entry point, routes by mode
  sync.js           — multi-version sync logic
  release.js        — GitHub Release creation
  validate.js       — PIE compliance checks
  utils/
    config.js       — reads .pie-mirror.yml
    composer.js     — reads/writes composer.json
    github.js       — Octokit wrapper, tarball download
    versions.js     — version normalization/comparison
    git.js          — git operations (commit, tag, push)
    hooks.js        — post-extract hook execution
```
