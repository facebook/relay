---
id: defining-types
title: "Defining Types"
slug: /guides/relay-resolvers/defining-types/
description: How to define types for your client state schema
---

You can think of client state resolvers as defining a GraphQL server that runs in the client. Just like with a server-defined GraphQL server you will need to define the _types_ that exist in your schema as well as the _fields_ on those types. Just like a GraphQL server, fields are defined as functions that compute the GraphQL value from the parent object. In Relay Resolvers we call this parent JavaScript object the "model" of the type.

:::info
Each client state GraphQL type is backed by a JavaScript object type which these docs will refer to as its "model type". Resolvers "on" this type will be passed an instance of this type as their first argument.
:::

Resolver types are defined using the `@RelayResolver` tag followed by the name of the type you are defining. By default Relay assumes your client types are “strong”, meaning each instance has an ID which is unique within the type. This property allows Relay to apply a number of optimizations, such as memoizing resolver computation.

### Defining a “strong” type

Strong types are defined by a docblock followed by an exported function whose name matches the type's name, and which accepts an ID as its only argument and returns an instance of the type’s model. Resolvers that define edges to this type will simply need to return the ID of the object, rather than deriving the model themselves.

```tsx
/**
 * @RelayResolver User
 */
export function User(id: DataID): UserModel {
  return UserService.getById(id);
}
```

:::tip
Elsewhere in the docs this function is referred to as the “model resolver” for the type.
:::

Generally objects in your client data store will be able to change over time. To support this Relay Resolvers support resolvers that subscribe to the underlying data source. To learn about this, see the page on [Live Fields](./live-fields.md).

### Defining a “weak” type

If your type does not have a unique identifier, you can define it as “weak” by adding the `@weak` docblock tag. Weak types are defined by a docblock followed by an exported type definition matching the types name. Resolvers that define edges to weak types will need to return a fully populated model object matching this type.

```tsx
/**
 * @RelayResolver ProfilePicture
 * @weak
 */
export type ProfilePicture = { url: string, height: number, width: number };
```

:::tip
Generally weak types are used for creating a namespace for a set of fields that ultimately "belong" to a parent object.
:::
