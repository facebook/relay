---
id: editor-support
title: Editor Support
slug: /editor-support/
keywords:
- LSP
- Language Server Protocol
- VS Code
- VSCode
---

import useBaseUrl from '@docusaurus/useBaseUrl';

*TL;DR: We have a [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=meta.relay)*

---

The Relay compiler has a rich understanding of the GraphQL embedded in your code. We want to use that understanding to imporve the developer experience of writing apps with Relay. So, starting in [v14.0.0](https://github.com/facebook/relay/releases/tag/v14.0.0), the new Rust Relay compiler can provide language features directly in your code editor. This means:

#### Relay compiler errors surface as red squiggles directly in your editor

<img src={useBaseUrl('img/docs/editor-support/diagnostics.png')} />

#### Autocomplete throughout your GraphQL tagged template literals

<img src={useBaseUrl('img/docs/editor-support/autocomplete.png')} />

#### Hover to see type information and documentation about Relay-specific features

<img src={useBaseUrl('img/docs/editor-support/hover.png')} />

#### `@deprecated` fields are rendered using ~~strikethrough~~

<img src={useBaseUrl('img/docs/editor-support/deprecated.png')} />

#### Click-to-definition for fragments, fields and types

<img src={useBaseUrl('img/docs/editor-support/go-to-def.gif')} />

#### Quick fix suggestions for common errors

<img src={useBaseUrl('img/docs/editor-support/code-actions.png')} />

## Language Server

The editor support is implemented using the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) which means it can be used by a variety of editors, but in tandem with this release, [Terence Bezman](https://twitter.com/b_ez_man) from [Coinbase](https://www.coinbase.com/) has contributed an official VS Code extension.

[**Find it here!**](https://marketplace.visualstudio.com/items?itemName=meta.relay)

## Why Have a Relay-Specific Editor Extension?

The GraphQL foundation has an official language server and [VS Code extension](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) which provides editor support for GraphQL generically. This can provide a good baseline experience, but for Relay users, getting this information directly from the Relay compiler offers a number of benefits:

* Relay compiler errors can surface directly in the editor as “problems”, often with suggested quick fixes
* Hover information is aware Relay-specific features and directives and can link out to relevant documentation
