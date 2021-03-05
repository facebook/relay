---
id: refetching-queries
title: Refetching Queries
slug: /guided-tour/refetching/refetching-queries/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

To refresh a query, we can also use the `useQueryLoader` Hook described in our [Fetching Queries for Rendering](../../rendering/queries/) section:

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
  const [startTransition, isRefreshing] = useTransition();
  const [refreshedQueryRef, loadQuery] = useQueryLoader<AppQueryType>(AppQuery);

  const refresh = () => {
    startTransition(() => {
      // Load the query again using the same original variables.
      // Calling loadQuery will update the value of refreshedQueryRef.
      // The fetchPolicy ensures we always fetch from the server and skip
      // the local data cache.
      const {variables} = props.appQueryRef;
      loadQuery(variables, {fetchPolicy: 'network-only'});
    })
  };

  const data = usePreloadedQuery<AppQueryType>(
    AppQuery,
    refreshedQueryRef ?? props.appQueryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        disabled={isRefreshing}
        onClick={() => refresh()}>
        Fetch latest count {isRefreshing ? <LoadingSpinner /> : null}
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We call `loadQuery` in the event handler for refreshing, so the network request starts immediately, and then pass the `refreshedQueryRef` to `usePreloadedQuery` so we render the updated data.
* We are passing a `fetchPolicy` of `‘network-only'` to ensure that we always fetch from the network and skip the local data cache.
* Calling `loadQuery` will re-render the component and cause `usePreloadedQuery` to suspend (as explained in [Transitions and Updates that Suspend](../../rendering/loading-states/)), since a network request will be required due to the `fetchPolicy` we are using. This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, to show a fallback loading state, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) in order to show the appropriate pending or loading state.
    * In this case, we are using the pending flag provided by `useTransition`, `isRefreshing`, in order render a pending state while the request is active, i.e. to render the busy spinner and to disable our UI control.
    * Using this pending state is optional, however, note that since `loadQuery` will cause the component to suspend, regardless of whether we're rendering a pending state, we should *always* use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.



<DocsRating />
