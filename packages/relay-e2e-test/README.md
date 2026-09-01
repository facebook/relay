# Relay E2E Tests

Markdown-driven end-to-end tests for Relay. Each test is a self-contained `.md` file that defines a GraphQL server (via [Grats](https://grats.capt.dev/)), a Relay-powered React component, and optional interaction steps. The test harness extracts the code blocks, compiles them with Grats + relay-compiler, renders with React Testing Library, runs interactions, and snapshot-tests the output.

Tests run against **Relay runtime packages from source** (`packages/relay-runtime/` and `packages/react-relay/`), so changes are reflected immediately without a build step.

## Running tests

From the repo root:

```
yarn test:e2e
```

Run a single fixture by name:

```
yarn test:e2e -- --testNamePattern defer
```

### First-time setup

The e2e package has its own `node_modules` (isolated `react@19`, `graphql@16`):

```
cd packages/relay-e2e-test && yarn install
```

The babel-plugin-relay must be built before running tests:

```
yarn build
```

### Compiler resolution

The test harness resolves the relay-compiler binary in this order:

1. `RELAY_COMPILER_BINARY` env var
2. Local cargo build: `compiler/target/debug/relay`
3. npm fallback: `node_modules/.bin/relay-compiler`

To test compiler changes, build with `cargo build --manifest-path=compiler/Cargo.toml --bin relay` and re-run tests.

When the `CI` environment variable is set, the npm fallback is a hard error rather than a silent downgrade to the last published release. `babel-plugin-relay` is resolved the same way, so CI must run `yarn build` first. Both are backstops: the two things that run this suite in CI — GitHub Actions and the fbsource Buck test — each supply their own binaries.

## Updating snapshots

Snapshots are plain `.snap.md` files, but follow jest's standard semantics:

```
yarn test:e2e -u      # rewrite changed snapshots
yarn test:e2e --ci    # never write; a new or changed snapshot fails
```

A new fixture's snapshot is written on a plain `yarn test:e2e`; a *changed* snapshot always fails unless `-u` is passed. Jest treats a CI environment as `--ci` automatically, so commit the generated `.snap.md` alongside its fixture.

## Writing fixtures

For the complete writing guide including fixture format, server/client code patterns, the interaction DSL, and snapshot behavior, see [`.llms/skills/relay-e2e-test.md`](.llms/skills/relay-e2e-test.md).
