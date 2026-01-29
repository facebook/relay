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
import schema from './relay-compiler-config-schema.json';

## Compiler Config Options

For information about where the Relay compiler looks for its config file, or a minimal config, see the [Relay Compiler](./compiler.md#Configuration) page.

If you need more advanced options of the Relay Compiler Config, the exhaustive full schema can be found below. The shape of the Relay Compiler Config is given as `ConfigFile`. Note that while the shapes are documented in pseudo TypeScript, the compiler is parsing them in Rust so some subtle differences may exist.

:::tip
Install the [Relay VSCode extension](../editor-support.md) to get autocomplete, hover tips, and type checking for the options in your Relay config.
:::

<CompilerConfig schema={schema} definitions={schema.definitions} />
