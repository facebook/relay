# Running E2E Tests (Internal / fbsource)

## Directory layout

| | Path |
|---|---|
| Repo root | `xplat/js/RKJSModules/Libraries/Relay/oss/__github__/` |
| Relay packages | `oss/relay-runtime/`, `oss/react-relay/` (siblings of `__github__/`) |
| babel-plugin-relay | npm fallback (`babel-plugin-relay` in e2e `node_modules`) |
| Fixtures | `packages/relay-e2e-test/fixtures/` under `__github__/` |

The test harness resolves these paths transparently via `resolveRelayPackage()` in `repoRoot.js` and `findBabelPluginRelay()` in `jest-transform.js`.

## First-time setup

```bash
cd xplat/js/RKJSModules/Libraries/Relay/oss/__github__

# 1. Install root dependencies
yarn install --ignore-scripts --ignore-engines

# 2. Install e2e package dependencies (includes babel-plugin-relay from npm)
cd packages/relay-e2e-test && yarn install --ignore-engines
```

No `yarn build` step is needed — the babel plugin is installed from npm.

## Commands

All commands run from `xplat/js/RKJSModules/Libraries/Relay/oss/__github__/`.

Run all e2e tests:

```
yarn test:e2e
```

Run a single fixture by name (use the path without extension, e.g. `queries/greeting`):

```
yarn test:e2e -- --testNamePattern greeting
```

## Compiler resolution

The test harness resolves the relay-compiler binary in this order:

1. `RELAY_COMPILER_BINARY` env var
2. Local cargo build: `compiler/target/debug/relay`
3. npm fallback: `node_modules/.bin/relay-compiler`

To test compiler changes, build with `cargo build --manifest-path=compiler/Cargo.toml --bin relay` and re-run tests.
