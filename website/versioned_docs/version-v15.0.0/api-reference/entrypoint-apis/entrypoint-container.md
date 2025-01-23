---
id: entrypoint-container
title: EntryPointContainer
slug: /api-reference/entrypoint-container/
description: API reference for EntryPointContainer, a React component used to render the root component of an entrypoint
keywords:
  - entrypoint
  - container
  - root
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

## `EntryPointContainer`

<FbInternalOnly>

For more information, see the [Defining EntryPoints](../../guides/entrypoints/using-entrypoints/#defining-entrypoints) and [Consuming EntryPoints](../../guides/entrypoints/using-entrypoints/#-entrypoints) guides.

</FbInternalOnly>

```js
function EntryPointContainer({
  entryPointReference,
  props,
}: {
  +entryPointReference: PreloadedEntryPoint<TEntryPointComponent>,
  +props: TRuntimeProps,
}): ReactElement
```

A React component that renders a preloaded EntryPoint.

* `entryPointReference`: the value returned from a call to `loadEntryPoint` or acquired from the `useEntryPointLoader` hook.
* `props`: additional runtime props that will be passed to the `Component`

<DocsRating />
