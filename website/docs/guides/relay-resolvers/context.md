---
id: context
title: "Context"
slug: /guides/relay-resolvers/context
description: Context in Relay Resolvers
---
import {FbInternalOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In order to pass a service, or other values to be shared with all resolvers, the `LiveResolverStore` provides a means of passing context. This gets passed to the third argument of all resolvers (live and non-live).

## Setup

In order to pass context to live resolvers, pass a `liveResolverContext` argument to the initialization of `LiveResolverStore` before creating the environment:

```js
const store = new LiveResolverStore(source, {
  liveResolverContext: {
    store: customStore,
  },
});
```

## Usage in Resolvers

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
        {label: 'Flow', value: 'Flow'},
    ]
  })}>
  <TabItem value="Docblock">

The third argument in a resolver will contain the context type which contains the value passed into the store on initialization.

```tsx
import type { LiveState } from 'relay-runtime';

/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(
  _key: undefined, 
  _args: undefined, 
  context: IResolverContextType
): LiveState<number> {
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

The third argument in a resolver will contain the context type which contains the value passed into the store on initialization.

```tsx
import type { LiveState } from 'relay-runtime';

/**
 * @RelayResolver
 */
export function counter(
  _key: void, 
  _args: void, 
  context: IResolverContextType
): LiveState<number> {
  return {
    read: () => context.store.getState().counter,
    subscribe: (callback) => {
      return context.store.subscribe(callback);
    },
  };
}
```

  </TabItem>
</Tabs>

## Type Checking

In order to ensure that the resolver is implemented with the correct types, pass a `liveResolverContextType` in the project config. This parameter expects a type name and a `path` to import from:

```json
{
    "name": "project",
    "language": "flow",
    "liveResolverContextType": { 
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
    "liveResolverContextType": { 
        "name": "IResolverContextType", 
        "package": "@package/name" 
    }
}   
```