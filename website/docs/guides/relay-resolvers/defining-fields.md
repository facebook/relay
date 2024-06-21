---
id: defining-fields
title: "Defining Fields"
slug: /guides/relay-resolvers/defining-fields/
description: How to define fields for your client state schema using Relay Resolvers
---

Defining fields on a client type is as simple as defining a resolver function which accepts an instance of your model type as its first argument and returns the field value. Note that the exported function name must match the field name.

## Syntax

Relay resolvers are marked via docblocks above a resolver function. `@RelayResolver` is the tag to indicate the start of any relay resolver definition. To define a field on a GraphQL model type `TypeName`, add `TypeName` followed by a dot followed by the field definition using GraphQL's schema definition language: https://spec.graphql.org/June2018/#FieldDefinition

```js
/**
* @RelayResolver TypeName.fieldName(arg1: ArgTypeName): FieldTypeName
*/
```

A simple field might look something like this:

```tsx
/**
 * @RelayResolver User.name: String
 */
export function name(user: UserModel): string {
  return user.name;
}
```

:::note
Relay will take care of efficiently recomputing resolvers when any of their inputs (in this case the model instance) change, so you don’t need to worry about memoizing your resolver function.
:::

This is just a simple resolver that reads from the model type and returns a scalar value. To learn about the full menu of capabilities that resolver fields support see:

* [Resolver Return Types](./return-types.md)
* [Field Arguments](./field-arguments.md)
* [Live Fields](./live-fields.md)
* [Derived Fields](./derived-fields.md)
