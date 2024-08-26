---
id: semantic-nullability
title: "Semantic Nullability"
slug: /guides/semantic-nullability/
description: Experimental support for semantic nullability
keywords:
- "null"
- nullability
- semanticNonNull
---

:::warning
**Experimental**: Because Strict Semantic Nullability is still in flux, the implementation and behavior within Relay are subject to change and may have unexpected behavior as we learn more about the idea and its implications.
:::

## Motivation

One of GraphQL's strengths is its field-granular error handling which can dramatically improve response resiliency. However, today that error handling depends upon field nullability, which is the reason it is a [recommended best practice](https://graphql.org/learn/best-practices/#nullability) to default all fields to being nullable. This creates a trade-off where __enabling maximum resiliency means client developers must manually handle all possible permutations of field nullability__ within their components. [`@required`](./required-directive.md) can help a bit, but is ultimately a very blunt tool.

## Proposed Solution

[Semantic Nullability](https://github.com/graphql/graphql.github.io/blob/nullability-post/src/pages/blog/2024-08-14-exploring-true-nullability.mdx#our-latest-proposal) is an early GraphQL spec proposal that aims to decouple error handling and nullability in the GraphQL spec to enable maximum resiliency while still exposing the "semantic nullability", (the nullability of the actual resolver function/method on the server) of the field to the client.

The proposal works by allowing the schema to specify a new type of nullability of "null only on error". If a client sees this type, _and_ the client has some strategy for handling field errors out-of-band, it may treat the field that is exposed to user code as non-nullable.

The full spec change will likely require adding additional syntax to GraphQL's schema definition language, but in the meantime, various GraphQL servers and clients have collaborated on a temporary directive [`@semanticNonNull`](https://specs.apollo.dev/nullability/v0.2/) that can be used to experiment with this idea.

In short, you can add `@semanticNonNull` to a field in your schema to indicate that the field is non-nullable in the semantic sense, but that the client should still be prepared to handle errors.

## Enabling Semantic Nullability in Relay

To try out Semantic Nullability in Relay, you can enable the `experimentalEmitSemanticNullabilityTypes` option in your Relay compiler config file. With this flag enabled, Relay will look for `@semanticNonNull` directives in your schema and generate non-nullable Flow/TypeScript types for those fields if you enable client-side error handling using the [`@throwOnFieldError`](../api-reference/graphql/graphql-directives.md#throwonfielderror-experimental) directive.

```json title="relay.config.json"
{
  "language": "typescript",
  "schema": "./schema.graphql",
  "experimentalEmitSemanticNullabilityTypes": true
}
```

If your server will never return `null` for a user's name, except in the case of errors, for example because it's resolver is typed as non-nullable, you can then apply `@semanticNonNull` to that field in your schema.

```graphql title="schema.graphql"
directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION

type User {
  name: String @semanticNonNull
}
```

In your runtime code, near where you configure your Relay Environment, enable the appropriate feature flags.

```js
import { RelayFeatureFlags } from "relay-runtime";
// @ts-ignore DefinitelyTyped is missing this
RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;
```

Once enabled, you can add `@throwOnFieldError` to your fragments to indicate that the client should throw an error if any field errors are encountered when the fragment is read.

In the below example, Relay's generated TypeScript or Flow types for `user.name` will be non-nullable.

:::caution
If Relay receives a field error for `user.name`, `useFragment` will throw an error. For this reason, it's important to ensure that you are have adequate [React error boundaries](../guided-tour/rendering/error-states.md) in place to catch these errors.
:::

```js
import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UserComponent_user$key,
};

function UserComponent(props: Props) {
  const user = useFragment(
    graphql`
      fragment UserComponent_user on User @throwOnFieldError {
        name # Will be typed as non-nullable
      }
    `,
    props.user,
  );

  return <div>{user.name}</div>
}
```

## By Example

For a hands on example, see [this example project](https://github.com/captbaritone/grats-relay-example/pull/1) showing Relay configured to use `@semanticNonNull` and `@throwOnFieldError` alongside [Grats](https://grats.capt.dev/) which [has support](https://grats.capt.dev/docs/guides/strict-semantic-nullability/) for automatically deriving a schema that includes the experimental `@semanticNonNull` directives.

## Further Reading

- [True Nullability Schema](https://github.com/graphql/graphql-wg/discussions/1394)
- [Strict Semantic Nullability](https://github.com/graphql/graphql-wg/discussions/1410)
- [RFC: SemanticNonNull type (null only on error)](https://github.com/graphql/graphql-spec/pull/1065)
- [Grat's support/documentation for `@SemanticNonNull`](https://grats.capt.dev/docs/guides/strict-semantic-nullability/)
- [Apollo's specification for this directive](https://specs.apollo.dev/nullability/v0.2/)
- [Support for `@SemanticNonNull` in Apollo Kotlin](https://www.apollographql.com/docs/kotlin/v4/advanced/nullability/#handle-semantic-non-null-with-semanticnonnull) added in [4.0.0-beta.3](https://github.com/apollographql/apollo-kotlin/releases/tag/v4.0.0-beta.3)
