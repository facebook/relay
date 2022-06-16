# Relay for VSCode

The official extension to support Relay in VSCode.

<p align="center">
  <img src="https://github.com/facebook/relay/raw/main/vscode-extension/readme/demo.gif"/>
</p>

## Installation

Search for "Relay GraphQL" in the VS Code extensions panel or install through [the marketplace](https://marketplace.visualstudio.com/items?itemName=meta.relay).

## Setup

- Make sure you have a Relay config file somewhere in your project.
  - We support standard config file formats (`.yml`, `.js`, `.json`), and the the `relay` field in your `package.json`
- Make sure you have the `relay-compiler` installed in your project. The bare minimum for this extension is v13.
- Make sure you are able to run the `relay-compiler` command from the command line. If `yarn relay-compiler` works, it's very likely that the extension will work. See more on [debugging below](#debugging).
- Remove / disable any conflicting GraphQL extensions you have installed.

## Configuration

- `relay.autoStartCompiler` (default: `false`) Whether or not we should automatically start the Relay Compiler in watch mode when you open a project.

- `relay.outputLevel` (default: `quiet-with-errors`) Specify the output level of the Relay language server. The available options are

  - quiet
  - quiet-with-errors
  - verbose
  - debug

- `relay.pathToBinary` (default: null) A path relative to the Relay binary relative to the root of your project. If this is not specified, we will try to find one in your `node_modules` folder.

- `relay.rootDirectory` (default: VSCode project root) A path relative to the root of your VSCode project for the extension to work from. The default value is the root of your project. This will change where we start looking for the relay-compiler node module. This will also affect where the LSP server is started, therefore affecting how the relay config is found. This is helpful if your project is in a nested directory.

- `relay.pathToConfig` (default: null) Path to a relay config relative to the `rootDirectory`. Without this, the compiler will search for your config. This is helpful if your relay project is in a nested directory.

## Features

- IntelliSense
- Hover type information
- Diagnostics (Errors, Warnings)
- Go to Definition for fragments, fields, GraphQL types, etc.
- GraphQL syntax highlighting within .graphql and JavaScript/TypeScript files.

## Commands

- `Restart Language Server`: Restart the Relay language server.

## Known Issues

### Relay Compiler > v13

We built the language server around the new Rust compiler. We do not have plans to support any version < v13.

### One Relay Config

The new Relay Compiler supports multi-project configs. If you have multiple projects using Relay inside of a single repo, you should try out this new config format. Currently, the VSCode extension only works with a singular Relay config.

e.g. if you have your `relay.config.js` in a nested directory like `/projects/projectA/relay.config.js`, the extension will fail to start since the Relay Compiler will not be able to find the Relay config.

**Exception**

If you open the nested directory as the root workspace in VSCode, the extension may work, your mileage may vary.

### VSCode Workspaces

We do not support running multiple instances of the LSP at once. We currently use the deprecated `rootPath` property from the VSCode API. This means we will start the Relay Compiler at the directory which your VSCode project is opened. **Once we fix this, we will be able to support multiple Relay configs.**

## Credits

- [`vscode-graphql`](https://github.com/graphql/graphiql/tree/main/packages/vscode-graphql). All of the grammars for syntax highlighting were taken directly from vscode-graphql.
