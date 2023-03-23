# Relay for VSCode

The official extension to support Relay in VSCode.

## Features

- IntelliSense
- Hover type information
- Diagnostics (Errors, Warnings)
- Go to Definition for fragments, fields, GraphQL types, etc.
- GraphQL syntax highlighting within .graphql and JavaScript/TypeScript files.
- Supports workspaces with multiple Relay projects. [Example](https://github.com/relayjs/relay-examples/blob/main/.vscode/settings.json)

<p align="center">
  <img src="https://github.com/facebook/relay/raw/main/vscode-extension/readme/demo.gif"/>
</p>

## Installation

Search for "Relay GraphQL" in the VS Code extensions panel or install through [the marketplace](https://marketplace.visualstudio.com/items?itemName=meta.relay).

## Setup

- Make sure you have at least one Relay config file somewhere in your project.
  - We support standard config file formats (`.yml`, `.js`, `.json`), and the the `relay` field in your `package.json`
- Make sure you have the `relay-compiler` installed in your project. The bare minimum for this extension is v13.
- Make sure you are able to run the `relay-compiler` command from the command line. If `yarn relay-compiler` works, it's very likely that the extension will work.
- Remove / disable any conflicting GraphQL extensions you have installed.

## Configuration

### `relay.autoStartCompiler` (default: `false`)

Configures whether to automatically start the Relay Compiler in watch mode when you open a project.

### `relay.projects` (default: `null`)

An optional array of project configuration in the form `{name: string, rootDirectory: string, pathToConfig: string}`. If omitted, it is assumed your workspace uses a single Relay config and the compiler will search for your config file. This option should be used when your Relay project is in a sub-directory of your workspace or you have multiple Relay projects in your workspace.

**name**: The name of the project. This will be used to display messages related to the project's output.

**rootDirectory**: A path relative to the root of your VSCode workspace for the extension to work from. This will change where we start looking for the relay-compiler node module. This will also affect where the LSP server is started, therefore affecting how the Relay config is found.

**pathToConfig**: Path to a Relay config relative to the `rootDirectory` config option. Without this, the compiler will search for your config. This option can be omitted if your Relay config is directly below your `rootDirectory`.

For a multi-project example, assuming you have two `relay.config.js` files in your code tree, you would setup the configuration like so.

```js
"relay.projects": [
  // Relay config is beneath rootDirectory (e.g. apps/first-project/relay.config.js) therefore
  // no need to provide the pathToConfig option
  {
    name: "my-first-project",
    rootDirectory: "apps/first-project/"
  },
  // Relay config is beneath a sub-directory, e.g. apps/second-project/config/relay.config.js
  {
    name: "my-second-project",
    rootDirectory: "apps/second-project/",
    pathToConfig: "config/"
  }
]
```

### `relay.pathToBinary` (default: `null`)

A path to the Relay binary relative to the root of your workspace. If this is not specified, we will try to find one in your `node_modules` folder.

### `relay.compilerOutputLevel` (default: `verbose`)

Specify the output level of the Relay compiler. The available options are

- quiet
- quiet-with-errors
- verbose
- debug

### `relay.lspOutputLevel` (default: `quiet-with-errors`)

Specify the output level of the Relay language server. The available options are

- quiet
- quiet-with-errors
- verbose
- debug

## Commands

- `Restart Language Server`: Restart the Relay language server.

## Known Issues

### Relay Compiler > v13

We built the language server around the new Rust compiler. We do not have plans to support any version < v13.

## Debugging

### `Relay LSP client connection got closed unexpectedly`

This toast message means that we failed to start the Relay compiler on your project. Viewing the output logs should give you the error output. In order to debug this, go to the project that failed and try to run the Relay compiler yourself (e.g. `yarn run relay-compiler`). Hopefully you'll get the same or a similar error here as well that will help you debug the problem. If you're able to run the Relay compiler locally, the extension should be able to as well.

## Migration

### Migrating from version 1.x to version 2.x

The primary change between version 1 and version 2 of the extension is supporting workspaces with multiple Relay projects. If you previously weren't using the `relay.rootDirectory` or `relay.pathToConfig` options, no migration is necessary. If you were using these two options the extension will keep working, but you should migrate to the `relay.projects` configuration.

Before:

```
"relay.rootDirectory": "apps/client/",
"relay.pathToConfig": "apps/client/config",
```

After:

```
"relay.projects": [{
  "name": "Client App",
  "rootDirectory: "apps/client/",
  "pathToConfig": "config"
}]
```

## Credits

- [GraphQL Syntax](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax) All of the GraphQL syntax highlighting is supported by this extension.
