---
id: context
title: "Context"
slug: /guides/relay-resolvers/context
description: Context in Relay Resolvers
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In order to pass a service, or other values to be shared with all resolvers, the `LiveResolverStore` provides a means of passing context. This gets passed to the third argument of all resolvers (live and non-live). This context argument analogous to the [context argument](https://graphql.org/learn/execution/#root-fields--resolvers) used on the server which usually holds things like the database connection.

## Setup

In order to pass context to live resolvers, pass a `resolverContext` argument to the initialization of `LiveResolverStore` before creating the environment:

```js
const store = new LiveResolverStore(source, {
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

The third argument in a resolver will contain the context type which contains the value passed into the store on initialization.

```js
import type { LiveState } from 'relay-runtime';

/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(
  _key,
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

Flow syntax is not currently supported in Flow

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