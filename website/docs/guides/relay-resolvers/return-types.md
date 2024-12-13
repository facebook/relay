---
id: return-types
title: "Return Types"
slug: /guides/relay-resolvers/return-types/
description: Showing the different types of return values for Relay Resolvers
keywords:
- resolvers
- derived
- selectors
- reactive
---

Relay Resolvers support a number of different return types, each of which has different semantics. This page will walk through the different types of supported return values and how they are used.

## Scalar Types

The simplest type for a resolver to return is a built-in GraphQL scalar value. Scalar values are values that can be represented as a primitive value in GraphQL, such as a string, number, or boolean. To return a scalar simply define your resolver as returning the scalar type and then return the corresponding JavaScript value from your resolver function.

```tsx
/**
 * @RelayResolver Post.isValid: Boolean
 */
export function isValid(post: PostModel): boolean {
  return post.content !== "" && post.author != null;
}
```

## List Types

Resolvers may also return a list of values. To do so, define your resolver as returning a list of the corresponding type and return an array from your resolver function.

```tsx
/**
 * @RelayResolver User.favoriteColors: [String]
 */
export function favoriteColors(user: UserModel): string[] {
  return user.favoriteColors;
}
```

This pattern can be used for the other types, with the exception of server types, which don't yet support lists.

## Client-defined GraphQL Types

Resolvers can also model edges to other GraphQL types in your Resolver schema. If the type was defined as a "strong" type, the resolver function must return an object `{ id: DataID }` where `DataID` is the ID of the object. Relay will take care of invoking the type's model resolver function.

```tsx
import {DataID} from 'relay-runtime';
/**
 * @RelayResolver Post.author: User
 */
export function author(post: PostModel): { id: DataID } {
  return { id: post.authorId };
}
```

If the type was defined as `@weak`, the resolver function must return an object matching the type's model type.

```tsx
/**
 * @RelayResolver User.profilePicture: ProfilePicture
 */
export function profilePicture(user: UserModel): ProfilePicture {
  return {
    url: user.profilePicture.url,
    width: user.profilePicture.width,
    height: user.profilePicture.width,
  }
}
```

:::tip
Relay will emit type assertions in its generated code to help catch errors where a resolver implementation does not match whats declared in its docblock.
:::

## Server Types

Relay Resolvers also support modeling edges to types defined on your server schema that implement the [`Node` specification](https://graphql.org/learn/global-object-identification/#node-root-field). Since objects which implement Node each have a globally unique ID, resolvers modeling edges to these server types simply need to return that unique ID.

At compile-time Relay derives a GraphQL query for each selections on this field and will lazily fetch that data on render.

```tsx
import {DataID} from 'relay-runtime';
/**
 * @RelayResolver Post.author: User
 */
export function author(post: PostModel): DataID {
  return post.authorId;
}
```

:::warning
Edges to server types that are only known the client force Relay to fetch data lazily which will force an additional cascading network roundtrip. This is generally not optimal and should be avoided where possible.
:::

To highlight this point, at compile time, Relay requires that selection that reads client to server edge field annotate the field with the `@waterfall` directive. This is intended to remind the author and reviewer that a tradeoff is being made here and to carefully consider the implications.

```tsx
function Post() {
  const data = useLazyLoadQuery(graphql`
    query PostQuery {
      post {
        author @waterfall {
          name
        }
      }
    }`, {});
  return <p>{data.post.author.name}</p>;
}
```

## Abstract Types

Resolvers may return some permutations of "abstract" types (GraphQL unions and interfaces). To use this feature simply use the abstract type's name in the docblock field description and include the typename in the object returned from your resolver. For "strong" types, that will look like: `{id: DataID, __typename: string}`. For "weak" types that will look like: `{__relay_model_instance: T, __typename: string}`.

```tsx
import {DataID} from 'relay-runtime';

type AnimalTypenames = "Cat" | "Dog";
/**
 * @RelayResolver User.pet: Animal
 */
export function pet(user: User): {id: DataID, __typename: AnimalTypenames } {
  return {id: "5", __typename: "Dog" }
}
```

:::tip
Relay will generate type assertions to ensure your resolver function returns the expected type. However, not all combinations are supported. For example, Relay does not yet support the following permutations of abstract types: Unions including weak types, abstract types which mix strong add weak types, and abstract types which include server-backed types.
:::

While abstract types themselves cannot be defined using Resolver syntax today, you may define interfaces and unions, as well as their members, using [Client Schema Extensions](../client-schema-extensions.md). For example:

```graphql title="client-schema.graphql"
interface Animal {
 legs: Int
}

extend type Cat implements Animal {
  __do_not_use: String # Placeholder because GraphQL does not allow empty field sets.
}
```

## JavaScript Values

There are rare cases where you want to return an arbitrary JavaScript value from your Resolver schema, one which cannot not have a corresponding GraphQL type. As an escape hatch Relay supports a custom return type `RelayResolverValue` that allows you to return any JavaScript value from your resolver. **JavaScript values returned from resolvers should be immutable.**

Consumers of this field will see a TypeScript/Flow type that is derived from your resolver function's return type.

```tsx
/**
 * @RelayResolver Post.publishDate: RelayResolverValue
 */
export function metadata(post: PostModel): Date {
  return post.publishDate;
}
```

:::warning
Use of `RelayResolverValue` should be considered an "escape hatch" and may be deprecated in future versions of Relay. In most cases a preferable pattern is to define a custom scalar in your [client schema extensions](../client-schema-extensions.md) and add a type definition for that custom scalar in your Relay config.
:::
