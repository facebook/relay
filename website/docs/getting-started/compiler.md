---
id: compiler
title: Relay Compiler
slug: /guides/compiler/
description: Relay guide to the compiler
keywords:
- compiler
---

Relay depends upon ahead-of-time compilation of GraphQL queries and fragments to generate artifacts that are used at runtime.

The Relay compiler is a command line tool that reads GraphQL fragments, queries, and mutations in your JavaScript code and generates TypeScript/Flow types and additional JavaScript code that gets included in your code via [Relay's Babel Plugin](./babel-plugin.md).

This guide explains configuring and using the Relay Compiler.

## Configuration

The Relay compiler will look for a Relay config in the following locations. It's up to you to decide which location works best for your project.

* `relay.config.json` in your project root
* `relay.config.(js/mjs/ts)` in your project root
* A `"relay"` key in your `package.json`

The Relay compiler config tells Relay things like where it can find your GraphQL schema and what language your code is written in. A minimal Relay compiler config looks like this:

```json title="relay.config.json"
{
  "src": "./src",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

:::tip
Install the [Relay VSCode extension](../editor-support.md) to get autocomplete, hover tips, and type checking for the options in your relay config.
:::

The compiler config is very powerful, and includes many specialized configuration options. For a full enumeration of the available options see the [Compiler Configuration](./compiler-config.md) page.


## Running the compiler

It is generally recommended that you add a `scripts` entry to your `package.json` to make it easy to run the Relay compiler for your project.

```json title="package.json"
{
  "scripts": {
    // change-line
    "relay": "relay-compiler"
  }
}
```

With this added you can run the Relay compiler like so:

```sh
npm run relay
```

### Watch mode

If you have [watchman](https://facebook.github.io/watchman) installed you can pass `--watch` to the Relay compiler to have it continue running and automatically update generated files as you edit your product code:

```sh
npm run relay --watch
```

### Codemods

The Relay compiler supprts some built in codemods. Learn more in the [Codemods Guide](../guides/codemods.md).

### Help

To learn about the other capabilities of the Relay compiler see it's extensive `--help` output:

```sh
npm run relay --help
```
