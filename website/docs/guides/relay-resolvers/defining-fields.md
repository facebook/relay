---
id: defining-fields
title: "Defining Fields"
slug: /guides/relay-resolvers/defining-fields/
description: How to define fields for your client state schema using Relay Resolvers
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Defining fields on a client type is as simple as defining a resolver function which accepts an instance of your model type as its first argument and returns the field value. Note that the exported function name must match the field name.

## Syntax

Relay resolvers are marked via docblocks above a resolver function. `@RelayResolver` is the tag to indicate the start of any Relay resolver definition. To define a field on a GraphQL model type `TypeName`:

<Tabs
  groupId="resolver"
  defaultValue="Docblock"
  values={fbContent({
    internal: [
      {label: 'Docblock', value: 'Docblock'},
      {label: 'Flow', value: 'Flow'},
    ],
    external: [
      {label: 'Docblock', value: 'Docblock'},
    ]
  })}>
  <TabItem value="Docblock">

 Add `TypeName` followed by a dot followed by the field definition using GraphQL's schema definition language: https://spec.graphql.org/June2018/#FieldDefinition

```js
/**
* @RelayResolver TypeName.fieldName(arg1: ArgTypeName): FieldTypeName
*/
```

  </TabItem>

  <TabItem value="Flow">
  <FbInternalOnly>

Import and use the Flow type for the object, Relay finds the GraphQL type linked to `TypeName`, and use the function name as the field name

```tsx
import {TypeName} from 'TypeObject';

/**
 * @RelayResolver
 */
export function fieldName(user: TypeName): string {
  return user.name;
}
```

  </FbInternalOnly>
  </TabItem>
</Tabs>

A simple field might look something like this:

<Tabs
  groupId="resolver"
  defaultValue="Docblock"
  values={fbContent({
    internal: [
      {label: 'Docblock', value: 'Docblock'},
      {label: 'Flow', value: 'Flow'},
    ],
    external: [
      {label: 'Docblock', value: 'Docblock'},
    ]
  })}>
  <TabItem value="Docblock">

```tsx
/**
 * @RelayResolver User.name: String
 */
export function name(user: UserModel): string {
  return user.name;
}
```
  </TabItem>

  <TabItem value="Flow">
  <FbInternalOnly>

```tsx
/**
 * @RelayResolver
 */
export function name(user: UserModel): string {
  return user.name;
}
```

  </FbInternalOnly>
  </TabItem>
</Tabs>

:::note
Relay will take care of efficiently recomputing resolvers when any of their inputs (in this case the model instance) change, so you don’t need to worry about memoizing your resolver function.
:::

This is just a simple resolver that reads from the model type and returns a scalar value. To learn about the full menu of capabilities that resolver fields support see:

* [Resolver Return Types](./return-types.md)
* [Field Arguments](./field-arguments.md)
* [Live Fields](./live-fields.md)
* [Derived Fields](./derived-fields.md)
