---
id: relay-resolvers
title: "Relay Resolvers"
slug: /guides/relay-resolvers/
description: Relay guide to Relay Resolvers
keywords:
- resolvers
- derived
- selectors
- reactive
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly} from 'internaldocs-fb-helpers';

Relay Resolvers is an experimental Relay feature which enables modeling derived state as client-only fields in Relay’s GraphQL graph. Similar to server [resolvers](https://graphql.org/learn/execution/), a Relay Resolver is a function which defines how to compute the value of a GraphQL field. However, unlike server resolvers, Relay Resolvers are evaluated reactively on the client. A Relay Resolver reads fields off of its parent object and returns a derived result. If any of those fields change, Relay will automatically reevaluate the resolver.

Relay Resolvers are particularly valuable in apps which store client state in Relay via [client schema extensions](https://relay.dev/docs/guides/client-schema-extensions/), since they allow you to compose together client data, server data — and even other Relay Resolver fields — into fields which update reactively as the underlying data changes.

Relay Resolvers were originally conceived of as an alternative to Flux-style [selectors](https://redux.js.org/usage/deriving-data-selectors) and can be thought of as providing similar capabilities.

Concretely, Relay Resolvers are defined as functions annotated with a special docblock syntax. The Relay compiler will automatically recognize these docblocks in any JavaScript file and use them to extend the schema that is available within your project.

Let’s look at an example Relay Resolver:

```jsx
import type {UserGreetingResolver$key} from 'UserGreetingResolver.graphql';
import {graphql} from 'relay-runtime';
import {readFragment} from 'relay-runtime/store/ResolverFragments';

/**
 * @RelayResolver
 *
 * @onType User
 * @fieldName greeting
 * @rootFragment UserGreetingResolver
 *
 * A greeting for the user which includes their name and title.
 */
export default function userGreetingResolver(userKey: UserGreetingResolver$key): string {
  const user = readFragment(graphql`
    fragment UserGreetingResolver on User {
      honorific
      last_name
    }`, userKey);

  return `Hello ${user.honorific} ${user.greeting}!`;
}
```

This resolver adds a new field `greeting` to the `User` object type. It reads the `honorific` and `last_name` fields off of the parent `User` and derives a greeting string. The new `greeting` field may now be used by any Relay component throughout your project which has access to a `User`.

Consuming this new field looks identical to consuming a field defined in the server schema:

```jsx
function MyGreeting({userKey}) {
  const user = useFragment(`
    fragment MyGreeting on User {
      greeting
    }`, userKey);
  return<h1>{user.greetig}<h1>;
}
```

## Doblock Fields

The Relay compiler looks for the following fields in any docblocks that includes `@RelayResolver`:

- `@RelayResolvers` (required)
- `@onType` or `@onInterface` (required) The GraphQL type/interface on which the new field should be exposed
- `@fieldName` (required) The name of the new field
- `@rootFragment` (required) The name of the fragment read by `readFragment`
- `@deprecated` (optional) Indicates that the field is [deprecated](https://spec.graphql.org/June2018/#sec--deprecated). May be optionally followed text giving the reason that the field is deprecated.

The  docblock may also contain free text. This free text will be used as the field’s human-readable description, which will be surfaced in Relay’s editor support on hover and in autocomplete results.

## Relay Resolver Signature

In order for Relay to be able to call a Relay Resolver, it must conform to a set of conventions:

1. The resolver function must accept a single argument, which is the key for its root fragment.
2. The resolver function must be the default export of its module (only one resolver per module)
3. The resolver must read its fragment using the special `readFragment` function.
4. The resolver function must be pure
5. The resolver’s return value must be immutable

Unlike server resolvers, Relay Resolvers may return any JavaScript value. This includes classes, functions and arrays. However, we generally encourage having Relay Resolvers return scalar values and only returning more complex JavaScript values (like functions) as an escape hatch.

<FbInternalOnly>
## Lint Rule

In many cases, the contents of the docblock can be derived from the javascript implementation. In those cases, the [`relay-resolvers`](https://www.internalfb.com/eslint/relay-resolvers) ESLint rule rule will offer auto-fixes to derive the docblock from the implementation and ensure that the two remain in sync. The lint rule also enforces a naming convention for resolver function and modules names.
</FbInternalOnly>

## How They Work

When parsing your project, the Relay compiler looks for `@RelayResolver` docblocks and uses them to add special fields to the GraphQL schema. If a query or fragment references one of these fields, Relay’s generated artifact for that query or fragment will automatically include an `import` of the resolver function. *Note that this can happen recursively if the Relay Resolver field you are reading itself reads one or more Relay Resolver fields.*

When the field is first read by a component, Relay will evaluate the Relay Resolver function and cache the result. Other components that read the same field will read the same cached value. If at any point any of the fields that the resolver reads (via its root fragment) change, Relay will reevaluate the resolver. If the return value changes (determined by `===` equality) Relay will propagate that change to all components (and other Relay Resolvers) that are currently reading the field.

## Current Limitations

- Relay Resolvers are still considered experimental. To use them you must ensure that the `ENABLE_RELAY_RESOLVERS` runtime feature flag is enabled, and that the `enable_relay_resolver_transform` feature flag is enabled in your project’s Relay config file.
- Relay Resolvers don’t yet have access to query variables. If this is functionality that would be useful to you, please get in touch.
- Currently Relay Resolvers only work with Haste module resolution, where modules are imported using their globally unique name, rather than by path.
- Error Handling: Currently if a Relay Resolver errors, it will throw in the component that first reads it. In the future we plan to have the following behavior:
    - If a Relay Resolver throws an error during evaluation the consumer of the field will get `null` and the error will be logged. This follows the GraphQL spec’s documented [best practice](https://redux.js.org/usage/deriving-data-selectors) of returning null when a field resolver errors in order to make reading data as robust as possible.
    - If your component requires a non-null value in order to render, and can’t provide a reasonable fallback experience, you can annotate the field access with `@required`.
