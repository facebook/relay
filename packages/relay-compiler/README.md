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

- There is a `relay.config.json`, `relay.config.js` file at the root of the
  project (i.e. in the same folder as the `package.json` file).
- The `package.json` file contains a `"relay"` key.

Alternatively, the path to a configuration file can be specified as an argument:

```shell
npm run relay ./relay.json
```

or with yarn

```shell
yarn relay ./relay.json
```

Please note, in this case you'll need to provide a separate configuration for
the [babel plugin](https://www.npmjs.com/package/babel-plugin-relay).

## File Finder

Relay compiler uses [`watchman`](https://facebook.github.io/watchman/) to find
file sources, and "listen" to the file changes in the "watch" mode. If
`watchman` is not available, the compiler will use
[glob](https://docs.rs/glob/latest/glob/) to query the filesystem for files.

## Configuration

### Supported compiler configuration options

- `src` Root directory of application code. [string] [required]
- `schema` Relative path to the file with GraphQL SDL file. [string] [required]
- `language` The name of the language used for input files and generated
  artifacts. ["javascript" | "typescript" | "flow"] [required].
- `artifactDirectory` A specific directory to output all artifacts to. When
  enabling this the babel plugin needs `artifactDirectory` to be set as well.
  [string]
- `excludes` Directories to ignore under `src`. [array] [default:
  ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"]]
- `schemaExtensions` List of directories with schema extensions. [array]
- `schemaConfig`
  - `nodeInterfaceIdField` Configure the name of the globally unique ID field on
    the Node interface. Useful if you can't use the default `id` field name.
    [string][default: "id"]
- `noFutureProofEnums` For `flow` only. This option controls whether or not a
  catch-all entry is added to enum type definitions values that may be added in
  the future. Enabling this means you will have to update your application
  whenever the GraphQL server schema adds new enum values to prevent it from
  breaking. [boolean][default: false]
- `customScalars` Mappings from custom scalars in your schema to built-in
  GraphQL types, for type emission purposes. [object]
- `eagerEsModules` This option enables emitting ES modules artifacts.
  [boolean][default: false]
- `persistConfig` Relay supports two versions of the config:
- - **Remote Persisting:**

  - `url` String, URL to send a POST request to to persist. This field is
    required in `persistConfig` [string]
  - `params` The document will be in a `POST` parameter `text`. This map can
    contain additional parameters to send. [object]
  - `concurrency` The maximum number concurrent requests that will be made to
    `url`. Use a value greater than 0. [number]

- - **Local Persisting:**
  - `file` Path for the JSON file that will contain operations map. Compiler
    will write queries in the format: { "md5(queryText) => "queryText", ...}.
    [string]

- `codegenCommand` Command name that for relay compiler. [string]

- `isDevVariableName` Name of the global variable for dev mode (`__DEV__`).
  [string]
- `jsModuleFormat` Formatting style for generated files. `commonjs` or `haste`.
  Default is `commonjs`. [string]

### CLI Arguments

- `--repersist` Run the persister even if the query has not changed.
- `--watch` Run compiler in `watch` mode. Requires
  [`watchman`](https://facebook.github.io/watchman/) to be installed.
- `--output` Output format of the compiler. Supported options: `debug` |
  `verbose` | `quiet` | `quietWithErrors`. The default value is `verbose`.
- `--validate` Looks for pending changes and exits with non-zero code instead of
  writing to disk.
