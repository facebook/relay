---
id: load-entrypoint
title: loadEntryPoint
slug: /api-reference/load-entrypoint/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## `loadEntryPoint`

This function is designed to be used with `EntryPointContainer` to implement the "render-as-you-fetch" pattern.

EntryPoint references returned from `loadEntryPoint` will leak data to the Relay store (if they have associated queries) unless `.dispose()` is called on them once they are no longer referenced. As such, prefer using `useEntryPointLoader` when possible, which ensures that EntryPoint references are correctly disposed for you. See the [`useEntryPointLoader`](../use-entrypoint-loader) docs for a more complete example.

<FbInternalOnly>

For more information, see the [Loading EntryPoints](../../guides/entrypoints/using-entrypoints/#loading-entrypoints) guide.

</FbInternalOnly>

```js
const EntryPoint = require('MyComponent.entrypoint.js');

const {loadQuery} = require('react-relay');

// Generally, your component should access the environment from the React context,
// and pass that environment to this function.
const getEntrypointReference = environment => loadEntryPoint(
  { getEnvironment: () => environment },
  EntryPoint,
  {id: '4'},
);

// later: pass entryPointReference to EntryPointContainer
// Note that EntryPoint references should have .dispose() called on them,
// which is missing in this example.
```

### Arguments

* `environmentProvider`: A provider for a Relay Environment instance on which to execute the request. If you're starting this request somewhere within a React component, you probably want to use the environment you obtain from using [`useRelayEnvironment`](../use-relay-environment/).
* `EntryPoint`: EntryPoint to load.
* `entryPointParams`: Parameters that will be passed to the EntryPoint's `getPreloadProps` method.

### Flow Type Parameters

* `TEntryPointParams`: Type parameter corresponding to the type of the first parameter of the `getPreloadProps` method of the EntryPoint.
* `TPreloadedQueries`: the type of the `queries` parameter to the EntryPoint component.
* `TPreloadedEntryPoints`: the type of the `entrypoints` parameter passed to the EntryPoint component.
* `TRuntimeProps`: the type of the `props` prop passed to `EntryPointContainer`. This object is passed down to the EntryPoint component, also as `props`.
* `TExtraProps`: if an EntryPoint's `getPreloadProps` method returns an object with an `extraProps` property, those extra props will be passed to the EntryPoint component as `extraProps`.
* `TEntryPointComponent`: the type of the EntryPoint.
* `TEntryPoint`: the type of the EntryPoint.

### Return Value

An EntryPoint reference with the following properties:

* `dispose`: a method that will release any query references loaded by this EntryPoint (including indirectly, by way of other EntryPoints) from being retained by the store. This can cause the data referenced by these query reference to be garbage collected.

The exact format of the return value is *unstable and highly likely to change*. We strongly recommend not using any other properties of the return value, as such code would be highly likely to break when upgrading to future versions of Relay. Instead, pass the result of `loadEntryPoint()` to `EntryPointContainer`.

### Behavior

* When `loadEntryPoint()` is called, each of an EntryPoint's associated queries (if it has any) will load their query data and query AST. Once both the query AST and the data are available, the data will be written to the store. This differs from the behavior of `prepareEntryPoint_DEPRECATED`, which would only write the data from an associated query to the store when that query was rendered with `usePreloadedQuery`.
* The EntryPoint reference's associated query references will be retained by the Relay store, preventing it the data from being garbage collected. Once you call `.dispose()` on the EntryPoint reference, the data from the associated queries is liable to be garbage collected.
* `loadEntryPoint` may throw an error if it is called during React's render phase.



<DocsRating />
