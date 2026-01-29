# Relay

GraphQL framework for React. Two main components: Rust compiler and JavaScript runtime.

# Compiler

Rust implementation in `compiler/`. Cargo workspace with crates in `compiler/crates/`.

## Formatting

All non-generated Rust code is autoformatted using `rust fmt`. Run this command before committing changes:

```bash
# Fix formatting
grep -r --include "*.rs" --files-without-match '@generated' crates | xargs rustfmt --config="skip_children=true"
```

## Fixture Tests

Compiler tests are generated from fixture files: input files with corresponding generated `.expected` output files in `crates/*/tests/*/fixtures/`.

**Never modify or create generated files directly**

**Regenerate test harness files** (after adding/removing fixtures):

Fixture `_test.rs` files are generated. After adding or removing an input fixture file regenerate the test file:

```bash
./scripts/update-fixtures.sh
```

**Update snapshots when output changes intentionally:**

To regenerate `*.expected` snapshots run:

```bash
UPDATE_SNAPSHOTS=1 cargo test
```



# Runtime

JavaScript packages in `packages/`. Main packages: `relay-runtime`, `react-relay`.

## Commands (from project root)

```bash
yarn jest                     # Run all tests
yarn jest <pattern>           # Run matching tests
yarn jest -u                  # Update Jest snapshots
yarn typecheck                # Flow type checking
yarn lint                     # ESLint
yarn prettier                 # Format code
./scripts/compile-test.js     # Update generated Relay artifacts for test files
```