# Running E2E Tests (GitHub / OSS)

## Directory layout

| | Path |
|---|---|
| Repo root | repo root |
| Relay packages | `packages/relay-runtime/`, `packages/react-relay/` |
| babel-plugin-relay | Built from source via `yarn build` → `dist/babel-plugin-relay/` |
| Fixtures | `packages/relay-e2e-test/fixtures/` |

## First-time setup

```bash
yarn install --frozen-lockfile --ignore-scripts
yarn build
cd packages/relay-e2e-test && yarn install
```

## Commands

All commands run from the repo root.

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

When the `CI` environment variable is set (GitHub Actions always sets it), step 3 is a hard error instead of a fallback — the published npm compiler can lag this repo, and a run that silently tests it is worse than no run at all. `babel-plugin-relay` is treated the same way, so CI must run `yarn build` before `yarn test:e2e`.

The `e2e-tests` job supplies the compiler itself, reusing the `relay-bin-linux-x64` artifact from `build-compiler`, so in practice these are backstops rather than the normal path.
