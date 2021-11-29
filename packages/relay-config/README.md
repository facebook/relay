## Relay Config

**Only works with Relay 12 and below, Relay 13 does not use this format**

Handles the config which would traditionally be passed into the relay-compiler via the CLI command-line, or inside the babel plugin config.

To use this package, first install it: `yarn add relay-config`, then create a `relay.config.js` which includes fields the relay-compiler CLI describes:

```js
// relay.config.js
module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: "./src",
  schema: "./data/schema.graphql",
  exclude: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
}
```

Here's the full CLI input reference (as of Relay v12)

```
relay-compiler --schema <path> --src <path> [--watch]

Options:
  --schema              Path to schema.graphql or schema.json[string] [required]
  --src                 Root directory of application code   [string] [required]
  --include             Directories to include under src
                                                       [array] [default: ["**"]]
  --exclude             Directories to ignore under src        [array] [default:
                 ["**/node_modules/**","**/__mocks__/**","**/__generated__/**"]]
  --extensions          File extensions to compile (defaults to extensions
                        provided by the language plugin)                 [array]
  --verbose             More verbose logging          [boolean] [default: false]
  --quiet               No output to stdout           [boolean] [default: false]
  --watchman            Use watchman when not in watch mode
                                                       [boolean] [default: true]
  --watch               If specified, watches files and regenerates on changes
                                                      [boolean] [default: false]
  --validate            Looks for pending changes and exits with non-zero code
                        instead of writing to disk    [boolean] [default: false]
  --persistFunction     An async function (or path to a module exporting this
                        function) which will persist the query text and return
                        the id.                                         [string]
  --persistOutput       A path to a .json file where persisted query metadata
                        should be saved. Will use the default implementation
                        (md5 hash) if `persistFunction` is not passed.  [string]
  --repersist           Run the persist function even if the query has not
                        changed.                      [boolean] [default: false]
  --noFutureProofEnums  This option controls whether or not a catch-all entry is
                        added to enum type definitions for values that may be
                        added in the future. Enabling this means you will have
                        to update your application whenever the GraphQL server
                        schema adds new enum values to prevent it from breaking.
                                                      [boolean] [default: false]
  --language            The name of the language plugin used for input files and
                        artifacts               [string] [default: "javascript"]
  --artifactDirectory   A specific directory to output all artifacts to. When
                        enabling this the babel plugin needs `artifactDirectory`
                        set as well.                                    [string]
  --customScalars       Mappings from custom scalars in your schema to built-in
                        GraphQL types, for type emission purposes. (Uses yargs
                        dot-notation, e.g. --customScalars.URL=String)
  --eagerESModules      This option enables emitting es modules artifacts.
                                                      [boolean] [default: false]
```
