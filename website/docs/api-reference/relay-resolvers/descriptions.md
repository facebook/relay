---
id: descriptions
title: "Descriptions"
slug: /api-reference/relay-resolvers/descriptions/
description: Adding human readable descriptions to your resolver schema [TODO name]
keywords:
- resolvers
- derived
- selectors
- reactive
---

One killer feature of GraphQL is that makes the data in your schema discoverable. Relay Resolvers bring this structure to your client data. By adding descriptions to your resolvers you can make your client state schema self-documenting as well.

Descriptions are surfaced by Relay's [VSCode extension](https://relay.dev/docs/editor-support/) in autocomplete and on hover.

You can add a description to a type by adding free text to the docblock tag:

:::info
GraphQL descriptions are expected to be written in markdown. Relay Resolvers will render these descriptions as markdown in the VSCode extension.
:::

## Types

```tsx
/**
 * @RelayResolver Author
 * 
 * An author in our **amazing** CMS. Authors can 
 * write posts but not nessisarily change their permissions.
 */
export function Author(id: DataID): AuthorModel {
  return AuthorService.getById(id);
}
```

## Fields

```tsx
/**
 * @RelayResolver Author.fullName: String
 * 
 * The author's first and last name. Does not include
 * any [honorifics](https://en.wikipedia.org/wiki/Honorific).
 */
export function fullName(author: AuthorModel): string {
  return `${author.firstName} ${author.lastName}`;
}
```