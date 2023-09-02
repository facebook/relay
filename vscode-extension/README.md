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

### `relay.rootDirectory` (default: `null`)

A path relative to the root of your VSCode workspace for the extension to work from. This will change where we start looking for the relay-compiler node module. This will also affect where the LSP server is started, therefore affecting how the Relay config is found. This is helpful if your project is in a nested directory.

### `relay.pathToConfig` (default: `null`)

Path to a Relay config relative to the `rootDirectory`. Without this, the compiler will search for your config. This is helpful if your Relay project is in a nested directory.

### `relay.autoStartCompiler` (default: `false`)

Configures whether to automatically start the Relay Compiler in watch mode when you open a project.

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

### Multi Project configuration

The following setting is only necessary if your VSCode workspace has multiple Relay projects, each with their own configuration file. You shouldn't use these settings in combination with the `rootDirectory` and `pathToConfig` settings. If the `projects` setting is used, both the `rootDirectory` and `pathToConfig` settings will be ignored.

### `relay.projects` (default: `null`)

An array of project configuration in the form `{name: string, rootDirectory: string, pathToConfig: string, autoStartCompiler: boolean}`. If omitted, it is assumed your workspace uses a single Relay config and the compiler will search for your config file.

**name**: The name of the project. This will be used to display messages related to the project's output.

**rootDirectory**: A path relative to the root of your VSCode workspace for the extension to work from. This will change where we start looking for the relay-compiler node module. This will also affect where the LSP server is started, therefore affecting how the Relay config is found.

**pathToConfig**: Path to a Relay config relative to the `rootDirectory` config option. Without this, the compiler will search for your config. This option can be omitted if your Relay config is directly below your `rootDirectory`.

**autoStartCompiler**: Only necessary to override the global 'autoStartCompiler' setting. Useful if you have multiple Relay projects in your workspace, but you only want the Relay compiler to run on specific projects.

For a multi-project example, assuming you have two `relay.config.js` files in your code tree, you would setup the configuration like so.

```js
"relay.autoStartCompiler": true,
"relay.projects": [
  // Relay config is beneath rootDirectory (e.g. apps/first-project/relay.config.js) therefore
  // no need to provide the pathToConfig option. When this workspace is opened, the Relay compiler
  // will start in watch mode automatically because this option does not override the global autoStartCompiler flag
  {
    name: "my-first-project",
    rootDirectory: "apps/first-project/"
  },
  // Relay config is beneath a sub-directory, e.g. apps/second-project/config/relay.config.js
  {
    name: "my-second-project",
    rootDirectory: "apps/second-project/",
    pathToConfig: "config/",
    autoStartCompiler: false // Don't run the relay compiler in watch mode on this project
  }
]
```

## Commands

- `Restart Language Server`: Restart the Relay language server.

## Known Issues

### Relay Compiler > v13

We built the language server around the new Rust compiler. We do not have plans to support any version < v13.

## Debugging

### `Relay LSP client connection got closed unexpectedly`

This toast message means that we failed to start the Relay compiler on your project. Viewing the output logs should give you the error output. In order to debug this, go to the project that failed and try to run the Relay compiler yourself (e.g. `yarn run relay-compiler`). Hopefully you'll get the same or a similar error here as well that will help you debug the problem. If you're able to run the Relay compiler locally, the extension should be able to as well.

## Credits

- [GraphQL Syntax](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax) All of the GraphQL syntax highlighting is supported by this extension.
