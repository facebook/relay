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

## Writing fixtures

For the complete writing guide including fixture format, server/client code patterns, the interaction DSL, and snapshot behavior, see [`.llms/skills/relay-e2e-test.md`](.llms/skills/relay-e2e-test.md).
