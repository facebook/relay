---
id: use-subscription
title: useSubscription
slug: /api-reference/use-subscription/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## `useSubscription`

Hook used to subscribe and unsubscribe to a subscription.

```js
import {graphql, useSubscription} from 'comet-relay';
import {useMemo} from 'react';

const subscription = graphql`subscription ...`;
function MyFunctionalComponent({ id }) {
  // IMPORTANT: your config should be memoized, or at least not re-computed
  // every render. Otherwise, useSubscription will re-render too frequently.
  const config = useMemo(() => { variables: { id }, subscription }, [id]);
  useSubscription(config);
  return <div>Move Fast</div>
}
```

### Arguments

* `config`: the same config passed to `requestSubscription`
    * NOTE: `useSubscription` doesn't automatically add `client_subscription_id`. You may need to provide an arbitrary `client_subscription_id` to `config.variables.input`

### Behavior

This is only a thin wrapper around the `requestSubscription` API. It will:

* Subscribe when the component is mounted with the given config
* Unsubscribe when the component is unmounted

If you have the need to do something more complicated, such as imperatively requesting a subscription, please use the `requestSubscription` API directly.


<DocsRating />
