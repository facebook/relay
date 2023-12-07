---
id: defining-types
title: "Defining Types"
slug: /api-reference/relay-resolvers/defining-types/
description: How to define types for your client state schema
keywords:
- resolvers
- derived
- selectors
- reactive
---

You should think of client state resolvers as defining a GraphQL server that runs in the client. Just like a server-defined GraphQL server you will need to define the types that exist in your schema as well as the fields on those types.

Just like a server GraphQL server, fields are defined as functions (or methods) that compute the GraphQL value from the parent object. In Relay Resolvers we call this parent JavaScript object the "model" of the type.

:::info
Each client state GraphQL type is backed by a JavaScript object type which these docs will refer to as its model type. Fields on this type will be passed an instance of this type as their first argument.
:::

Resolver types are defined using the `@RelayResolver` tag followed by the typename you are defining. By default Relay assumes your client types are “strong”, meaning each instance has a unique ID. This property allows Relay to apply a number of optimizations, such as memoizing resolver computation.

### Defining a “strong” type

Strong types ar defined by a docblock followed by an exported function whose name matches the type name and which accepts an ID as its first argument and returns an instance of the type’s model [TODO link]. Resolvers that defined edges to this type will simply need to return the ID of the object, rather than deriving the model themselves.

```tsx
/**
 * @RelayResolver User
 */
export function User(id: DataID): UserModel {
  return UserService.getById(id);
}
```

Elsewhere in the docs this function is referred to as the “model resolver” for the type.

[TODO: Link to @live docs]

### Defining a “weak” type

If your type does not have unique identifiers, you can define it as “weak” by adding the `@weak` docblock tag. Weak types are defined by docblock followed by an exported type definition matching the types name. Resolvers that define edges to weak types will need to return a fully populated model object[TODO LINK] matching this type.

```tsx
/**
 * @RelayResolver ProfilePicture
 * @weak
 */
export type ProfilePicture = { url: string, height: number, width: numbe };
```