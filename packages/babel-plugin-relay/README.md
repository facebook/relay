## babel-plugin-relay

Relay requires a Babel plugin to convert GraphQL tags to runtime artifacts.

A _very_ simplified example of what this plugin is doing:

```js
// It converts this code
const fragment = graphql`
  fragment User_fragment on User {
    name
  }
`;

// To require generated ASTs for fragments and queries
const fragment = require('__generated__/User_fragment.graphql');
```

## Plugin Configuration

`babel-plugin-relay` will discover the config if:

- There is a `relay.config.json`, `relay.config.js` file at the root of the
  project (i.e. in the same folder as the `package.json` file).
- The `package.json` file contains a `"relay"` key.

### Supported configuration options for `babel-plugin-relay`

- `artifactDirectory` A specific directory to output all artifacts to. When
  enabling this the babel plugin needs `artifactDirectory` to be set as well.
  [string]
- `eagerEsModules` This option enables emitting ES modules artifacts.
  [boolean][default: false]
- `codegenCommand` The command to run to compile Relay files. [string]
- `isDevVariableName` Name of the global variable for dev mode (e.g. `__DEV__`).
  [string]
- `jsModuleFormat` Formatting style for generated files. `commonjs` or `haste`.
  Default is `commonjs`. [string]

### Multi-project configuration

The plugin also supports multi-project configurations with two key components:

- `projects` An object where each key is a project name and its value is a project configuration. Each project can have any of the settings listed above (jsModuleFormat, eagerEsModules, etc.). Project settings override global settings. Use `output` instead of `artifactDirectory` in project configs. [object]

- `sources` An object mapping directory paths to project names. Each key is a directory path and its value is either a project name or an array of project names. The most specific matching path is used. [object]

When a file matches multiple projects, the first project's settings are used, and a warning is logged if there are conflicting settings.

[Configuration Instructions](https://relay.dev/docs/getting-started/installation-and-setup/#set-up-babel-plugin-relay)
