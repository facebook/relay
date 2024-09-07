---
id: derived-fields
title: "Derived Fields"
slug: /guides/relay-resolvers/derived-fields/
description: Defining field which are a pure function of other fields
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In addition to modeling client state, Relay Resolvers also allow you to define fields which are a pure function of other fields. These fields are called derived fields and can be defined on any type no matter if it's defined on the server or client.

For globally relevant data, resolvers have a few advantages of alternative solutions like [React Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks):

* **Global memoization** - Relay Resolvers automatically memoize derived fields. Unlike hooks, this cache is shared by all components in your application, so if two sibling components both read the same field, the computation will only be performed once.
* **Efficient updates** - If your derived resolver recomputes but derives the same value, Relay can avoid rerendering components that read the field.
* **Composable** - Derived fields can be composed with other derived fields, allowing you to build up complex, but explicit computation graphs.
* **Discoverable** - Values in the graph are discoverable via the GraphQL schema and thus are more likely to be discovered and reused instead of reinvented.
* **Documented** - GraphQL's field documentation and structured deprecation model make it easy to understand the purpose of a field and its intended use.

## Defining a Derived Resolver

Derived resolvers look like any other resolver except that they read GraphQL data instead of being computed from a parent model type. Derived resolvers read GraphQL data by defining a "root fragment" which is a GraphQL fragment defined on the parent type of the field.

The root fragment is defined using the `@rootFragment` docblock tag followed by the name of the fragment. This tells Relay to pass the resolver function a fragment key for that fragment. The fragment data may then be read using `readFragment` imported from `relay-runtime`.

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
import {readFragment} from 'relay-runtime';

/**
 * @RelayResolver User.fullName: String
 * @rootFragment UserFullNameFragment
 */
export function fullName(key: UserFullNameFragment$key): string {
  const user = readFragment(graphql`
    fragment UserFullNameFragment on User {
        firstName
        lastName
    }
  `, key);
  return `${user.firstName} ${user.lastName}`;
}
```
  </TabItem>

  <TabItem value="Flow">
  <FbInternalOnly>

```tsx
import {readFragment} from 'relay-runtime';

/**
 * @RelayResolver
 */
export function fullName(key: UserFullNameFragment$key): string {
  const user = readFragment(graphql`
    fragment UserFullNameFragment on User {
        firstName
        lastName
    }
  `, key);
  return `${user.firstName} ${user.lastName}`;
}
```

  </FbInternalOnly>
  </TabItem>
</Tabs>

:::info
Relay will track all the values read from the fragment and automatically recompute the resolver when any of those values change.
:::

## Composition

One powerful feature of derived resolvers is that they can read other Relay Resolver fields. This means you can define a derived resolver that combines server data, client data and even other derived resolvers. This allows you to build up complex, but explicit, computation graphs.

```tsx
/**
 * @RelayResolver CheckoutItem.isValid: Boolean
 * @rootFragment CheckoutItemFragment
 */
export function isValid(key): boolean {
  const item = readFragment(graphql`
    fragment CheckoutItemFragment on CheckoutItem {
      product {
        price
      }
      quantity
    }
  `, key);
  return item.product.price * item.quantity > 0;
}

/**
 * @RelayResolver ShoppingCart.canCheckout: Boolean
 * @rootFragment ShoppingCartFragment
 */
export function canCheckout(key): boolean {
  const cart = readFragment(graphql`
    fragment ShoppingCartFragment on ShoppingCart {
      items {
        isValid
      }
    }
  `, key);
  return cart.items.every(item => item.isValid);
}
```

## Passing Arguments to your @rootFragment

If a field in a derived resolver's root fragment requires arguments, you can pass them by adding an `@arguments` tag to the docblock tag. The `@argument` tag takes the name of the argument and the type of the argument. The argument type must be a valid GraphQL input type. For more information about arguments and Resolvers see [Field Arguments](./field-arguments.md).
