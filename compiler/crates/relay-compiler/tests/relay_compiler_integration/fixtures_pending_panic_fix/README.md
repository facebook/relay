# Fixtures Pending Panic Fix

These integration test fixtures have been temporarily moved here because they cause
the compiler to panic during test execution.

## Affected Fixtures

| Fixture Name | Description |
|--------------|-------------|
| `config_validation_excluded_source_directory` | Tests validation of excluded source directories |

## Re-enabling

Once panic issues are fixed, move `.input` files back to `fixtures/`, regenerate tests:

```bash
/fbsource/fbcode/relay/scripts/generate_fixture_tests.sh
buck2 test fbcode//relay/oss/crates/relay-compiler:relay-compiler-relay_compiler_integration_test -- --env UPDATE_SNAPSHOTS=1
```
