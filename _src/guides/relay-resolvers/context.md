---
id: context
title: "Context"
slug: /guides/relay-resolvers/context
description: Context in Relay Resolvers
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In order to pass a service, or other values to be shared with all resolvers, the `RelayModernStore` provides a means of passing context. This gets passed to the third argument of all resolvers (live and non-live). This context argument analogous to the [context argument](https://graphql.org/learn/execution/#root-fields--resolvers) used on the server which usually holds things like the database connection.

## Setup

In order to pass context to live resolvers, pass a `resolverContext` argument to the initialization of `RelayModernStore` before creating the environment:

```js
const store = new RelayModernStore(source, {
  resolverContext: {
    store: customStore,
  },
});
```

## Usage in Resolvers

<Tabs
  groupId="resolver"
  defaultValue="JavaScript"
  values={fbContent({
    internal: [
      {label: 'JavaScript', value: 'JavaScript'},
      {label: 'Flow', value: 'Flow'},
    ],
    external: [
      {label: 'JavaScript', value: 'JavaScript'},
        {label: 'Flow', value: 'Flow'},
    ]
  })}>
  <TabItem value="JavaScript">

The last argument in a resolver will contain the context type which contains the value passed into the store on initialization. If the resolver is on a model type or reads a `@rootFragment`, the context value will be the third argument. If the resolver is _not_ on a model type and does _not_ read a `@rootFragment` the context value will be passed as the thrid argument. Relay's generated artifacts will include generated type assertions to check that your resolver is typed correctly.

```js
import type { LiveState } from 'relay-runtime';

/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(
  _args,
  context
) {
  return {
    read: () => context.store.getState().counter,
    subscribe: (callback) => {
      return context.store.subscribe(callback);
    },
  };
}
```

  </TabItem>

  <TabItem value="Flow">

Context is not currently supported in Flow

  </TabItem>
</Tabs>

## Type Checking

In order to ensure that the resolver is implemented with the correct types, pass a `resolverContextType` in the project config. This parameter expects a type name and a `path` to import from:

```json
{
    "name": "project",
    "language": "flow",
    "resolverContextType": {
        "name": "IResolverContextType",
        "path": "path/to/file/IResolverContextType"
    }
}
```

To import from a package, use the following syntax for a `package` import:

```json
{
    "name": "project",
    "language": "flow",
    "resolverContextType": {
        "name": "IResolverContextType",
        "package": "@package/name"
    }
}
```
