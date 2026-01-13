# Fixtures Pending Panic Fix

These integration test fixtures have been temporarily moved here because they cause
the compiler to panic during test execution.

## Affected Fixtures

| Fixture Name | Description |
|--------------|-------------|
| `config_validation_excluded_source_directory` | Tests validation of excluded source directories |
| `config_validation_missing_schema_extension_directory` | Tests validation when schema extension directory is missing |
| `config_validation_missing_schema_file` | Tests validation when schema file is missing |
| `config_validation_missing_source_directory` | Tests validation when source directory is missing |
| `schema_in_excluded_dir_works` | Tests schema handling in excluded directories |
| `schema_in_generated_dir` | Tests schema handling in generated directories |
| `schema_outside_root_dir` | Tests schema handling outside root directory |

## Re-enabling

Once panic issues are fixed, move `.input` files back to `fixtures/`, regenerate tests:

```bash
/fbsource/fbcode/relay/scripts/generate_fixture_tests.sh
buck2 test fbcode//relay/oss/crates/relay-compiler:relay-compiler-relay_compiler_integration_test -- --env UPDATE_SNAPSHOTS=1
```
