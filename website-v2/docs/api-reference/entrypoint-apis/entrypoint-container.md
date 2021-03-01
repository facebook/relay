---
id: entrypoint-container
title: EntryPointContainer
slug: /api-reference/entrypoint-container/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## `EntryPointContainer`

<FbInternalOnly>

For more information, see the [Defining EntryPoints](https://www.internalfb.com/intern/wiki/Relay/Guides/entry-points/#defining-entrypoints) and [Consuming EntryPoints](https://www.internalfb.com/intern/wiki/Relay/Guides/entry-points/#consuming-entrypoints) guides.

</FbInternalOnly>

```js
function EntryPointContainer({
  entryPointReference,
  props,
}: {|
  +entryPointReference: PreloadedEntryPoint<TEntryPointComponent>,
  +props: TRuntimeProps,
|}): ReactElement
```

A React component that renders a preloaded EntryPoint.

* `entryPointReference`: the value returned from a call to `loadEntryPoint` or acquired from the `useEntryPointLoader` hook.
* `props`: additional runtime props that will be passed to the `Component`

<DocsRating />
