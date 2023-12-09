---
id: deprecated
title: "Deprecated"
slug: /api-reference/relay-resolvers/deprecated/
description: Marking fields in your client state schema [TODO name] as @deprecated
keywords:
- resolvers
- derived
- selectors
- reactive
---

GraphQL allows you to mark fields as `@deprecated` and provide an optional human-readable reason. Relay Resolvers bring this same convention to your client data. By marking fields in your client state schema [TODO name] as deprecated they will receive the same treatment as deprecated fields in your server GraphQL schema.

Deprecated fields are surfaced in Relay's [VSCode extension](https://relay.dev/docs/editor-support/) in autocomplete and on hover. Additionally, they will be rendered as greyed out and ~~struck through~~ in the editor.

:::info
GraphQL deprecation reasons are expected to be written in markdown. Relay Resolvers will render these descriptions as markdown in the VSCode extension.
:::

You can mark a field as deprecated by adding the `@deprecated` docblock tag followed by optional text to specify the reason.

```tsx
/**
 * @RelayResolver Author.fullName: String
 * 
 * @deprecated Google "Falsehoods Programmers Believe About Names"
 */
export function fullName(author: AuthorModel): string {
  return `${author.firstName} ${author.lastName}`;
}
```