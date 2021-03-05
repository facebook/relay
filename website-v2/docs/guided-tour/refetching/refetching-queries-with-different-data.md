---
id: refetching-queries-with-different-data
title: Refetching Queries with Different Data
slug: /guided-tour/refetching/refetching-queries-with-different-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

Similarly to [Refreshing Queries](../refetching-queries/), we can also use the `useQueryLoader` Hook described in our [Fetching Queries for Rendering](../../rendering/queries/) section, but this time passing *different query variables*:

```js
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';
import type {PreloadedQuery} from 'react-relay';

const React = require('React');
const {useTransition} = require('React');
const {graphql, usePreloadedQuery, useQueryLoader} = require('react-relay');

type Props = {
  appQueryRef: PreloadedQuery<AppQuery>,
};

const AppQuery = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
      friends {
        count
      }
    }
  }
`;

function App(props: Props) {
  const variables = {id: '4'};
  const [startTransition, isRefetching] = useTransition();
  const [refetchedQueryRef, loadQuery] = useQueryLoader<AppQueryType>(appQuery);

  const refetch = () => {
    startTransition(() => {
      // Load the query again using the same original variables.
      // Calling loadQuery will update the value of refreshedQueryRef.
      loadQuery({id: 'different-id'});
    })
  };

  const data = usePreloadedQuery<AppQueryType>(
    AppQuery,
    refetchedQueryRef ?? props.appQueryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        disabled={isRefetching}
        onClick={() => refetch()}>
        Fetch latest count {isRefetching ? <LoadingSpinner /> : null}
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We call `loadQuery` in the event handler for refreshing, so the network request starts immediately, and then pass the `refetchedQueryRef` to `usePreloadedQuery` so we render the updated data.
* We are not passing a `fetchPolicy` to `loadQuery`, meaning that it will use the default value of `‘store-or-network'`. We could provide a different when refetching the query in order to specify whether to use locally cached data (as we covered in [Reusing Cached Data For Render](../../reusing-cached-data/))
* Calling `loadQuery` will re-render the component and may cause `usePreloadedQuery` to suspend (as explained in [Transitions and Updates that Suspend](../../rendering/loading-states/)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, to show a fallback loading state, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) in order to show the appropriate pending or loading state.
    * In this case, we are using the pending flag provided by `useTransition`, `isRefetching`, in order render a pending state while the request is active, i.e. to render the busy spinner and to disable our UI control.
    * Using this pending state is optional, however, note that since `loadQuery` may cause the component to suspend, regardless of whether we're rendering a pending state, we should *always* use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.




<DocsRating />
