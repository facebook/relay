# Relay Compiler

Relay-Compiler is a code-generation toolkit for GraphQL. It contains the core
functionalities of GraphQL code-gen, including file parsing, validation, syntax
tree parsing and transformation.

## Configuration in package.json

The simplest way to configure relay is to add a new `relay` section to your
`package.json` that contains the relay config.

At minimum, the relay config must specify where to find source files (i.e. files
containing `graphql` literals) and the GraphQL schema for the project.

```
// adding new section to package json
{
  ...
 "scripts": {
    "relay": "relay-compiler"
 },
 ...
 // relay configuration
 "relay": {
    "src": "./src",
    "schema": "./src/schema/app_schema.graphql"
  }
}
```
Relay Compiler will automatically discover the config if:

- There is a `relay.config.json`, `relay.config.js`, `relay.config.cjs`
or `relay.config.mjs` file at the root of the project (i.e. in the same folder
as the `package.json` file).
- There is a `.relayrc.json`, `.relayrc.js`, `.relayrc.cjs`, `.relayrc.mjs`
or `.relayrc` file at the root of the project (i.e. in the same folder as
the `package.json` file).
- The `package.json` file contains a `"relay"` key.

Additionally, this config file can be specified with the CLI argument `--config`
as follows:

```shell
npm run relay --config ./relay.json
```

or with yarn

```shell
yarn relay --config ./relay.json
```

## File Finder
Relay compiler uses [`watchman`](https://facebook.github.io/watchman/) to find
file souces, and "listen" to the file  changes in the "watch" mode.
If `watchman` is not available, the compiler will
use [glob](https://docs.rs/glob/latest/glob/) to query the filesystem for files.

## Configuration

### Supported compiler configuration options

- `src`                 Root directory of application code.  [string] [required]
- `schema`              Relative path to the file with GraphQL SDL file.
                                                             [string] [required]
- `artifactDirectory`   A specific directory to output all artifacts to. When
                        enabling this the babel plugin needs `artifactDirectory`
                        to be set as well.                              [string]
- `language`            The name of the language used for input files and
                        generated artifacts.
                                       ["flow" | "typescript"] [default: "flow"]
- `excludes`            Directories to ignore under `src`.     [array] [default:
               ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"]]
- `schemaExtensions`    List of directories with schema extensions.      [array]
- `noFutureProofEnums`  For `flow` only. This option controls whether or not
                        a catch-all entry is added to enum type definitions
                        values that may be added in the future. Enabling this
                        means you will have to update your application whenever
                        the GraphQL server schema adds new enum values to
                        prevent it from breaking.      [boolean][default: false]
- `customScalars`       Mappings from custom scalars in your schema to built-in
                        GraphQL types, for type emission purposes.      [object]
- `eagerEsModules`      This option enables emitting ES modules artifacts.
                                                       [boolean][default: false]
- `persistConfig`
  - `url`               String, URL to send a POST request to to persist.
                                                                        [string]
  - `params`            The document will be in a `POST`
                        parameter `text`. This map can contain additional
                        parameters to send.                             [object]

### CLI configuration

We also support a limited set of CLI arguments that should cover the most cases
when you need to run the compiler.

- `--src`               Relative path to the source code.
- `--schema`            Relative path to schema file.
- `--artifactDirectory` Compiler output directory.
- `--watch`             Run compiler in `watch` mode
(requires [`watchman`](https://facebook.github.io/watchman/) to be installed).
