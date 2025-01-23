---
id: field-arguments
title: "Field Arguments"
slug: /guides/relay-resolvers/field-arguments/
description: Defining field arguments for resolver fields
---

## Runtime Arguments

If your resolver needs access to argument data at runtime, you can simply define arguments in the field definition of your resolver's docblock, and then read the argument as a property on the second argument to your resolver function.

```tsx
/**
 * @RelayResolver User.greet(salutation: String!): String
 */
export function greet(user: UserModel, args: { salutation: string }): string {
  return `${args.salutation}, ${user.name}!`;
}
```

Consuming this field will require passing the argument to the field in your GraphQL query:

```graphql
query MyQuery($salutation: String!) {
  me {
    greet(salutation: $salutation)
  }
}
```

This, in turn will require passing the argument when you fetch the query.

## Passing Arguments to your @rootFragment

If you are defining a [derived resolver](./derived-fields.md) and one of the fields in its root fragment requires arguments, you must define an explicit fragment argument using [@argumentDefinitions](../../api-reference/graphql/graphql-directives.md#argumentdefinitions) in your fragment definition. Your resolver field will then expect this argument to be passed as a field argument.

```tsx
/**
 * @RelayResolver User.fancyGreeting: String
 * @rootFragment UserFancyGreetingFragment
 */
export function fancyGreeting(key: UserFancyGreetingFragment$key): string {
  const user = readFragment(graphql`
    fragment UserFancyGreetingFragment on User @argumentDefinitions(
      salutation: {type: "String"},
    ) {
      name
      greet(salutation: $salutation)
    }
  `, key);
  return `${user.name} says ${user.greet}`;
}
```

Consuming this field will require passing the argument to the field in your GraphQL query:

```graphql
query MyQuery($salutation: String!) {
  me {
    fancyGreeting(salutation: $salutation)
  }
}
```
