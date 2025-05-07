---
id: compiler-config
title: Compiler Configuration
slug: /getting-started/compiler-config/
description: Schema description of the Relay Compiler configuration
keywords:
- compiler
- configuration
- config
hide_table_of_contents: false
---
import CompilerConfig from '@site/src/compiler-config/CompilerConfig';

The Relay Compiler will look for a Relay config in the following locations. It's up to you to decide which location works best for your project.

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

## Compiler Config Options

If you need more advanced options of the Relay Compiler Config, the exhaustive full schema can be found below. The shape of the Relay Compiler Config is given as `ConfigFile`.

<CompilerConfig />