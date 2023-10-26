---
id: graphql-directives
title: GraphQL Directives
slug: /api-reference/graphql-and-directives/
description: API Reference for GraphQL directives
keywords:
  - GraphQL
  - Directive
  - arguments
  - argumentDefinitions
  - connection
  - relay
  - inline
  - provider
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

Relay uses directives to add additional information to GraphQL documents, which are used by the [Relay compiler](../../guides/compiler/) to generate the appropriate runtime artifacts. These directives only appear in your application code and are removed from requests sent to your GraphQL server.

<OssOnly>
**Note:** The Relay compiler will maintain any directives supported by your server (such as `@include` or `@skip`) so they remain part of the request to the GraphQL server and won't alter generated runtime artifacts.
</OssOnly>
<FbInternalOnly>
**Note:** The Relay compiler will maintain any directives supported by your server (such as `@include` or `@skip`) so they remain part of the request to the GraphQL server and won't alter generated runtime artifacts. Additional directives are documented [here](https://www.internalfb.com/intern/wiki/GraphQL/APIs_and_References/Directives/#graphql-standard).
</FbInternalOnly>

## `@arguments`

`@arguments` is a directive used to pass arguments to a fragment that was defined using [`@argumentDefinitions`](#argumentdefinitions). For example:

```graphql
query TodoListQuery($userID: ID) {
  ...TodoList_list @arguments(count: $count, userID: $userID) # Pass arguments here
}
```

## `@argumentDefinitions`

`@argumentDefinitions` is a directive used to specify arguments taken by a fragment. For example:

```graphql
fragment TodoList_list on TodoList @argumentDefinitions(
  count: {type: "Int", defaultValue: 10},  # Optional argument
  userID: {type: "ID"},                    # Required argument
) {
  title
  todoItems(userID: $userID, first: $count) {  # Use fragment arguments here as variables
    ...TodoItem_item
  }
}
```

### Provided Variables
A provided variable is a special fragment variable whose value is supplied by a specified provider function at runtime. This simplifies supplying device attributes, user experiment flags, and other runtime constants to graphql fragments.

To add a provided variable:
- add an argument with `provider: "[JSModule].relayprovider"` to `@argumentDefinitions`
- ensure that `[JSModule].relayprovider.js` exists and exports a `get()` function
  -  `get` should return the same value on every call for a given run.
```graphql
fragment TodoItem_item on TodoList
@argumentDefinitions(
  include_timestamp: {
    type: "Boolean!",
    provider: "Todo_ShouldIncludeTimestamp.relayprovider"
  },
) {
  timestamp @include(if: $include_timestamp)
  text
}
```

```javascript
// Todo_ShouldIncludeTimestamp.relayprovider.js
export default {
  get(): boolean {
    // must always return true or false for a given run
    return check('todo_should_include_timestamp');
  },
};
```
Notes:

<FbInternalOnly>

- Even though fragments declare provided variables in `argumentDefinitions`, their parent cannot pass provided variables through `@arguments`.
- An argument definition cannot specify both a provider and a defaultValue.
- If the modified fragment is included in operations that use hack preloaders (`@preloadable(hackPreloader: true)`), you will need to manually add provided variables when calling `RelayPreloader::gen`.
    - Hack's typechecker will fail with `The field __relay_internal__pv__[JsModule] is missing.`
    - We strongly encourage switching to [Entrypoints](../../guides/entrypoints/using-entrypoints/) if possible.
- _Unstable / subject to change_
  - Relay transforms provided variables to operation root variables and renames them to `__relay_internal__pv__[JsModule]`.
    - Only relevant if you are debugging a query that uses provided variables.

</FbInternalOnly>

<OssOnly>

- Even though fragments declare provided variables in `argumentDefinitions`, their parent cannot pass provided variables through `@arguments`.
- An argument definition cannot specify both a provider and a defaultValue.
- _Unstable / subject to change_
  - Relay transforms provided variables to operation root variables and renames them to `__relay_internal__pv__[JsModule]`.
    - Only relevant if you are debugging a query that uses provided variables.

</OssOnly>

## `@connection(key: String!, filters: [String])`

With `usePaginationFragment`, Relay expects connection fields to be annotated with a `@connection` directive. For more detailed information and an example, check out the [docs on `usePaginationFragment`](../../guided-tour/list-data/rendering-connections).

## `@refetchable(queryName: String!)`

With `useRefetchableFragment` and `usePaginationFragment`, Relay expects a `@refetchable` directive. The `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are declared on `Viewer` or `Query` types, or on a type that implements `Node` (i.e. a type that has an id). The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`. For more detailed information and examples, check out the docs on [`useRefetchableFragment`](../use-refetchable-fragment/) or [`usePaginationFragment`](../use-pagination-fragment/).

## `@relay(plural: Boolean)`

When defining a fragment for use with a Fragment container, you can use the `@relay(plural: true)` directive to indicate that container expects the prop for that fragment to be a list of items instead of a single item. A query or parent that spreads a `@relay(plural: true)` fragment should do so within a plural field (ie a field backed by a [GraphQL list](http://graphql.org/learn/schema/#lists-and-non-null). For example:

```javascript
// Plural fragment definition
graphql`
  fragment TodoItems_items on TodoItem @relay(plural: true) {
    id
    text
  }
`;

// Plural fragment usage: note the parent type is a list of items (`TodoItem[]`)
fragment TodoApp_app on App {
  items {
    // parent type is a list here
    ...TodoItem_items
  }
}
```

## `@required`

`@required` is a directive you can add to fields in your Relay queries to declare how null values should be handled at runtime.

See also [the @required guide](../../guides/required-directive/).

## `@inline`

The hooks APIs that Relay exposes allow you to read data from the store only during the render phase. In order to read data from outside of the render phase (or from outside of React), Relay exposes the `@inline` directive. The data from a fragment annotated with `@inline` can be read using `readInlineData`.

In the example below, the function `processItemData` is called from a React component. It requires an item object with a specific set of fields. All React components that use this function should spread the `processItemData_item` fragment to ensure all of the correct item data is loaded for this function.

```javascript
import {graphql, readInlineData} from 'react-relay';

// non-React function called from React
function processItemData(itemRef) {
  const item = readInlineData(graphql`
    fragment processItemData_item on Item @inline {
      title
      price
      creator {
        name
      }
    }
  `, itemRef);
  sendToThirdPartyApi({
    title: item.title,
    price: item.price,
    creatorName: item.creator.name
  });
}
```

```javascript
export default function MyComponent({item}) {
  function handleClick() {
    processItemData(item);
  }

  const data = useFragment(
    graphql`
      fragment MyComponent_item on Item {
        ...processItemData_item
        title
      }
    `,
    item
  );

  return (
    <button onClick={handleClick}>Process {item.title}</button>
  );
}
```

## `@relay(mask: Boolean)`

 It is not recommended to use `@relay(mask: false)`. Please instead consider using the `@inline` fragment.

`@relay(mask: false)` can be used to prevent data masking; when including a fragment and annotating it with `@relay(mask: false)`, its data will be available directly to the parent instead of being masked for a different container.

Applied to a fragment definition, `@relay(mask: false)` changes the generated Flow types to be better usable when the fragment is included with the same directive. The Flow types will no longer be exact objects and no longer contain internal marker fields.

This may be helpful to reduce redundant fragments when dealing with nested or recursive data within a single Component.

Keep in mind that it is typically considered an **anti-pattern** to create a single fragment shared across many containers. Abusing this directive could result in over-fetching in your application.

In the example below, the `user` prop will include the data for `id` and `name` fields wherever `...Component_internUser` is included, instead of Relay's normal behavior to mask those fields:

```javascript
graphql`
  fragment Component_internUser on InternUser @relay(mask: false) {
    id
    name
  }
`;
```

<DocsRating />
