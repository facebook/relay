---
id: docblock-format
title: 'Docblock Format'
slug: /api-reference/relay-resolvers/docblock-format/
description: Docblock format for Relay Resolvers
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Relay Resolvers allow you to define additional types and fields in your GraphQL schema that are backed by client-side data. To achieve this, the Relay compiler looks for special `@RelayResolver` docblocks in your code. These docblocks define the types and fields in your schema and also tell Relay where to find the resolver functions that implement them.

For an overview of Relay Resolvers and how to think about them, see the [Relay Resolvers](../../guides/relay-resolvers/introduction.md) guide. This page documents the different docblock tags that the Relay compiler looks for, and how to use them.

:::note The Relay compiler only looks at docblocks which include the
`@RelayResolver` tag. Any other docblocks will be ignored.
:::

## `@RelayResolver TypeName`

The `@RelayResolver` tag followed by a single name defines a new GraphQL type in your schema. By default it is expected to be followed by an exported function whose name matches the type name. The function should accept an ID as its sole argument and return the JavaScript model/object which is the backing data for the type. See [`@weak`](#weak) for an alternative way to define the backing data for a type.

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
   * @RelayResolver User
   */
  export function User(id): UserModel {
    return UserModel.getById(id);
  }
  ```
  </TabItem>
  <TabItem value="Flow">

  ```tsx
  /**
   * @RelayResolver
   */
  export function User(id): UserModel {
    return UserModel.getById(id);
  }
  ```
  </TabItem>
</Tabs>



See the [Defining Types](../../guides/relay-resolvers/defining-types.md) guide for more information.

## `@RelayResolver TypeName.fieldName: FieldTypeName`

If the typename in a `@RelayResolver` tag is followed by a dot and then a field definition, it defines a new field on the type. The portion following the `.` is expected to follow GraphQL's
[schema definition language](https://spec.graphql.org/June2018/#FieldDefinition).

Field definitions are expected to be followed by an exported function whose name matches the field name. The function should accept the model/object returned by the type resolver as its sole argument and return the value of the field.

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

  ```tsx
  /**
   * @RelayResolver
   */
  export function name(user: UserModel): string {
    return user.name;
  }
  ```
  </TabItem>
</Tabs>

See the [Defining Fields](../../guides/relay-resolvers/defining-fields.md) guide for more information.

## `@rootFragment`

Relay Resolvers may also be used to model data that is derived from other data in the graph. These fields will be automatically recomputed by Relay when the data they depend on changes.

To define a derived field, use the `@rootFragment` tag on an existing field
definition, and follow it with the name of a fragment that defines the data that the field depends on. The resolver function for the field will be passed a fragment key which can be used to read the fragment data using `readFragment()`.

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
    const user = readFragment(
      graphql`
        fragment UserFullNameFragment on User {
          firstName
          lastName
        }
      `,
      key,
    );
    return `${user.firstName} ${user.lastName}`;
  }
  ```
  </TabItem>
  <TabItem value="Flow">

  ```tsx
  import {readFragment} from 'relay-runtime';

  /**
   * @RelayResolver
   */
  export function fullName(key: UserFullNameFragment$key): string {
    const user = readFragment(
      graphql`
        fragment UserFullNameFragment on User {
          firstName
          lastName
        }
      `,
      key,
    );
    return `${user.firstName} ${user.lastName}`;
  }
  ```
  </TabItem>
</Tabs>

See [Derived Fields](../../guides/relay-resolvers/derived-fields.md) for more information.

## `@live`

When modeling client state that can change over time, a resolver function which returns a single value is not sufficient. To accommodate this, Relay Resolvers allow you to define a field that returns a stream of values over time. This is done by adding the `@live` tag to a _field or type definition_.

`@live` resolvers must return an object with the shape of a `LiveStateValue` to allow Relay to read the current value and subscribe to changes.

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
  import type {LiveState} from 'relay-runtime';

  /**
  * @RelayResolver Query.counter: Int
  * @live
  */
  export function counter(): LiveState<number> {
    return {
      read: () => store.getState().counter,
      subscribe: cb => {
        return store.subscribe(cb);
      },
    };
  }
  ```
  </TabItem>
  <TabItem value="Flow">

  ```tsx
  import type {LiveState} from 'relay-runtime';

  /**
  * @RelayResolver
  */
  export function counter(): LiveState<number> {
    return {
      read: () => store.getState().counter,
      subscribe: cb => {
        return store.subscribe(cb);
      },
    };
  }
  ```

  </TabItem>
</Tabs>

See the [Live Fields](../../guides/relay-resolvers/live-fields.md) guide for
more information.

## `@weak`

By default, Relay Resolvers expect the backing data for a type to be returned by a resolver function. However, in some cases objects of a given type may not have identifiers. In this case, you can use the `@RelayResolver TypeName` syntax described above followed by the tag `@weak` to define a "weak" type.

Weak type declarations are expected to be followed by an exported type
definition whose name matches the type name.

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
  * @RelayResolver ProfilePicture
  * @weak
  */
  export type ProfilePicture = {
    url: string;
    width: number;
    height: number;
  };
  ```
  </TabItem>
  <TabItem value="Flow">

  ```tsx
  /**
  * @RelayResolver
  */
  export type ProfilePicture = {
    url: string;
    width: number;
    height: number;
  };
  ```
  </TabItem>
</Tabs>

See the [Weak Types](../../guides/relay-resolvers/defining-types.md#Defining a “weak” type) guide for more information including how to define an edge to a weak type.

## `@deprecated`

Just like the GraphQL schema definition language, Relay Resolvers support the `@deprecated` tag to mark a field as deprecated. The tag may be followed by a string which will be used as the deprecation reason. Deprecated fields will
receive special treatment in the editor if you are using the
[Relay VSCode extension](../../editor-support.md).

```tsx
/**
 * @RelayResolver User.name: String
 * @deprecated Use `fullName` instead.
 */
export function name(user: UserModel): string {
  return user.name;
}
```

See the [Deprecated](../../guides/relay-resolvers/deprecated.md) guide for more information.

## Descriptions

Any free text in the docblock (text not following a tag) will be used as the description for the type or field. This description will be surfaced in the editor if you are using the [Relay VSCode extension](../../editor-support.md).

```tsx
/**
 * @RelayResolver User.name: String
 *
 * What's in a name? That which we call a rose by any other name would smell
 * just as sweet.
 */
export function name(user: UserModel): string {
  return user.name;
}
```

See the [Descriptions](../../guides/relay-resolvers/descriptions.md) guide for more information.
