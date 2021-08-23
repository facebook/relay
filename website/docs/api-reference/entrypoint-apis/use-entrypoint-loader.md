---
id: use-entrypoint-loader
title: useEntryPointLoader
slug: /api-reference/use-entrypoint-loader/
description: API reference for useEntryPointLoader, a React hook used to load entrypoints in response to user events
keywords:
  - render-as-you-fetch
  - entrypoint
  - preload
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## `useEntryPointLoader`

Hook used to make it easy to safely work with EntryPoints, while avoiding data leaking into the Relay store. It will keep an EntryPoint reference in state, and dispose of it when it is no longer accessible via state.

<FbInternalOnly>

For more information, see the [Loading EntryPoints](https://www.internalfb.com/intern/wiki/Relay/Guides/entry-points/#loading-entrypoints) guide.

</FbInternalOnly>

```js
const {useEntryPointLoader, EntryPointContainer} = require('react-relay');

const ComponentEntryPoint = require('Component.entrypoint');

function EntryPointRevealer(): React.MixedElement {
  const environmentProvider = useMyEnvironmentProvider();
  const [
    entryPointReference,
    loadEntryPoint,
    disposeEntryPoint,
  ] = useEntryPointLoader(environmentProvider, ComponentEntryPoint);

  return (
    <>
      {
        entryPointReference == null && (
          <Button onClick={() => loadEntryPoint({})}>
            Click to reveal the contents of the EntryPoint
          </Button>
        )
      }
      {
        entryPointReference != null && (
          <>
            <Button onClick={disposeEntryPoint}>
              Click to hide and dispose the EntryPoint.
            </Button>
            <Suspense fallback="Loading...">
              <EntryPointContainer
                entryPointReference={entryPointReference}
                props={{}}
              />
            </Suspense>
          </>
        )
      }
    </>
  );
}
```

### Arguments

* `environmentProvider`: an object with a `getEnvironment` method that returns a relay environment.
* `EntryPoint`: the EntryPoint, usually acquired by importing a `.entrypoint.js` file.

### Flow Type Parameters

* `TEntryPointParams`: the type of the first argument to the `getPreloadProps` method of the EntryPoint.
* `TPreloadedQueries`: the type of the `queries` prop passed to the EntryPoint component.
* `TPreloadedEntryPoints`: the type of the `entryPoints` prop passed to the EntryPoint component.
* `TRuntimeProps`: the type of the `props` prop passed to `EntryPointContainer`. This object is passed down to the EntryPoint component, also as `props`.
* `TExtraProps`: if an EntryPoint's `getPreloadProps` method returns an object with an `extraProps` property, those extra props will be passed to the EntryPoint component as `extraProps` and have type `TExtraProps`.
* `TEntryPointComponent`: the type of the EntryPoint component.
* `TEntryPoint`: the type of the EntryPoint.

### Return value

A tuple containing the following values:

* `entryPointReference`: the EntryPoint reference, or `null`.
* `loadEntryPoint`: a callback that, when executed, will load an EntryPoint, which will be accessible as `entryPointReference`. If a previous EntryPoint was loaded, it will dispose of it. It may throw an error if called during React's render phase.
    * Parameters
        * `params: TEntryPointParams`: the params passed to the EntryPoint's `getPreloadProps` method.
* `disposeEntryPoint`: a callback that, when executed, will set `entryPointReference` to `null` and call `.dispose()` on it. It has type `() => void`. It should not be called during React's render phase.

### Behavior

* When the `loadEntryPoint` callback is called, each of an EntryPoint's associated queries (if it has any) will load their query data and query AST. Once both the query AST and the data are available, the data will be written to the store. This differs from the behavior of `prepareEntryPoint_DEPRECATED`, which would only write the data from an associated query to the store when that query was rendered with `usePreloadedQuery`.
* The EntryPoint reference's associated query references will be retained by the Relay store, preventing it the data from being garbage collected. Once you call `.dispose()` on the EntryPoint reference, the data from the associated queries is liable to be garbage collected.
* The `loadEntryPoint` callback may throw an error if it is called during React's render phase.


<DocsRating />
