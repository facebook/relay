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
import {FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

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

  return `Hello ${user.honorific} ${user.last_name}!`;
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
  return <h1>{user.greeting}</h1>;
}
```

## Docblock Fields

The Relay compiler looks for the following fields in any docblocks that includes `@RelayResolver`:

- `@RelayResolver` (required)
- `@onType` or `@onInterface` (required) The GraphQL type/interface on which the new field should be exposed
- `@fieldName` (required) The name of the new field
- `@rootFragment` (required) The name of the fragment read by `readFragment`
- `@deprecated` (optional) Indicates that the field is [deprecated](https://spec.graphql.org/June2018/#sec--deprecated). May be optionally followed text giving the reason that the field is deprecated.

The docblock may also contain free text. This free text will be used as the field’s human-readable description, which will be surfaced in Relay’s editor support on hover and in autocomplete results.

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

## Error Handling

In order to make product code as robust as possible, Relay Resolvers follow the GraphQL spec’s documented [best practice](https://graphql.org/learn/best-practices/#nullability) of returning null when a field resolver errors. Instead of throwing, errors thrown by Relay Resolvers will be logged to your environment's configured `requiredFieldLogger` with an event of kind `"relay_resolver.error"`. If you make use of Relay Resolves you should be sure to configure your environment with a `requiredFieldLogger` which reports those events to whatever system you use for tracking runtime errors.

If your component requires a non-null value in order to render, and can’t provide a reasonable fallback experience, you can annotate the field access with `@required`.

## Passing arguments to resolver fields

For resolvers (and live resolvers) we support two ways of defining field arguments:

1. GraphQL: Arguments that are defined via @argumentDefinitions on the resolver's fragment.
2. JS Runtime: Arguments that can be passed directly to the resolver function.
3. You can also combine these, and define arguments on the fragment and on the resolver's field itself, Relay will validate the naming (these arguments have to have different names), and pass GraphQL arguments to fragment, and JS arguments to the resolver's function.


Let’s look at the example 1:

## Defining Resolver field with Fragment Arguments

```js
/**
* @RelayResolver
* @fieldName **my_resolver_field**
* @onType **MyType**
* @rootFragment myResolverFragment
*/
function myResolver(key) {
   const data = readFragment(graphql`
       fragment myResolverFragment on MyType
            @argumentDefinitions(**my_arg**: {type: "Float!"}) {
            field_with_arg(arg: $my_arg) {
               __typename
            }
       }
   `, key);

   return data.field_with_arg.__typename;
}
```

### Using Resolver field with arguments for Fragment

This resolver will extend the **MyType** with the new field **my_resolver_field(my_arg: Float!)** and the fragment arguments for **myResolverFragment** can be passed directly to this field.

```js
const data = useLazyLoadQuery(graphql`
    query myQuery($id: ID, $my_arg: Float!) {
        node(id: $id) {
           ... on MyType {
                my_resolver_field(my_arg: $my_arg)
           }
        }
   }
`, { id: "some id", my_arg: 2.5 });
```

For these fragment arguments relay will pass then all queries/fragments where the resolver field is used to the resolver’s fragment.


### Defining Resolver field with Runtime (JS) Arguments

Relay resolvers also support runtime arguments that are not visible/passed to fragments, but are passed to the resolver function itself.

You can define these fragments using GraphQL’s [Schema Definition Language](https://graphql.org/learn/schema/) in the **@fieldName**

```js
/**
* @RelayResolver
* @fieldName **my_resolver_field(my_arg: String, my_other_arg: Int)**
* @onType **MyType**
* @rootFragment myResolverFragment
*/
function myResolver(key, args) {
   if (args.my_other_arg === 0) {
       return "The other arg is 0";
   }

   const data = readFragment(graphql`
       fragment myResolverFragment on MyType
           some_field
       }
   `, key);
   return data.some_field.concat(args.my_arg);
}
```

### Using Resolver field with runtime arguments

This resolver will extend **MyType** with the new field **my_resolver_field(my_arg: String, my_other_arg: Int).**

```js
const data = useLazyLoadQuery(graphql`
    query myQuery($id: ID, $my_arg: String!) {
        node(id: $id) {
           ... on MyType {
                my_resolver_field(my_arg: $my_arg, my_other_arg: 1)
           }
        }
   }
`, { id: "some id", my_arg: "hello world!"});
```

### Defining Resolver field with Combined Arguments

We can also combine both of these approaches and define field arguments both on the resolver’s fragment and on the field itself:

```js
/**
* @RelayResolver
* @fieldName **my_resolver_field(my_js_arg: String)**
* @onType **MyType**
* @rootFragment myResolverFragment
*/
function myResolver(key, args) {
   const data = readFragment(graphql`
       fragment myResolverFragment on MyType
            @argumentDefinitions(**my_gql_arg**: {type: "Float!"}) {
            field_with_arg(arg: $my_arg) {
               __typename
            }
       }
   `, key);

   return `Hello ${args.my_js_arg}, ${data.field_with_arg.__typename}`;
}
```

### Using Resolver field with combined arguments

Relay will extend the **MyType** with the new resolver field that has two arguments: **my_resolver_field(my_js_arg: String, my_gql_arg: Float!)

**
Example query:

```js
const data = useLazyLoadQuery(graphql`
    query myQuery($id: ID, $my_arg: String!) {
        node(id: $id) {
           ... on MyType {
                my_resolver_field(my_js_arg: "World", my_qql_arg: 2.5)
           }
        }
   }
`, { id: "some id" });
```

## Current Limitations

- Relay Resolvers are still considered experimental. To use them you must ensure that the `ENABLE_RELAY_RESOLVERS` runtime feature flag is enabled, and that the `enable_relay_resolver_transform` feature flag is enabled in your project’s Relay config file.
