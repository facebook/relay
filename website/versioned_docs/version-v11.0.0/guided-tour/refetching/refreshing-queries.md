---
id: refreshing-queries
title: Refreshing Queries
slug: /guided-tour/refetching/refreshing-queries/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbRefreshingUsingRealTimeFeatures from './fb/FbRefreshingUsingRealTimeFeatures.md';
import FbRefreshingQueriesUsingUseQueryLoader from './fb/FbRefreshingQueriesUsingUseQueryLoader.md';
import FbAvoidSuspenseCaution from './fb/FbAvoidSuspenseCaution.md';
import FbRefreshingQueriesUsingUseLazyLoadQuery from './fb/FbRefreshingQueriesUsingUseLazyLoadQuery.md';
import OssAvoidSuspenseNote from './OssAvoidSuspenseNote.md';

When referring to **"refreshing a query"**, we mean fetching the *exact* same data that was originally rendered by the query, in order to get the most up-to-date version of that data from the server.

## Using real-time features

<FbInternalOnly>
  <FbRefreshingUsingRealTimeFeatures />
</FbInternalOnly>

<OssOnly>
If we want to keep our data up to date with the latest version from the server, the first thing to consider is if it appropriate to use any real-time features, which can make it easier to automatically keep the data up to date without manually refreshing the data periodically.

One example of this is using [GraphQL Subscriptions](https://relay.dev/docs/en/subscriptions), which will require additional configuration on your server and [network layer](https://relay.dev/docs/en/subscriptions#configure-network).
</OssOnly>

## When using `useQueryLoader` / `loadQuery`

To refresh a query using the [`useQueryLoader`](../../../api-reference/use-query-loader/) Hook described in our [Fetching Queries for Render](../../rendering/queries/#fetching-queries-for-render) section, we only need to call `loadQuery` again:

<FbInternalOnly>
  <FbRefreshingQueriesUsingUseQueryLoader />
</FbInternalOnly>

<OssOnly>

```js
/**
 * App.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const [queryRef, loadQuery] = useQueryLoader<AppQueryType>(
    AppQuery,
    props.appQueryRef /* initial query ref */
  );

  const refresh = useCallback(() => {
    // Load the query again using the same original variables.
    // Calling loadQuery will update the value of queryRef.
    // The fetchPolicy ensures we always fetch from the server and skip
    // the local data cache.
    const {variables} = props.appQueryRef;
    loadQuery(variables, {fetchPolicy: 'network-only'});
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        refresh={refresh}
        queryRef={queryRef}
      />
    </React.Suspense>
  );
}
```

```js
/**
 * MainContent.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

// Renders the preloaded query, given the query reference
function MainContent(props) {
  const {refresh, queryRef} = props;
  const data = usePreloadedQuery<AppQueryType>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
          friends {
            count
          }
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        onClick={() => refresh()}>
        Fetch latest count
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We call `loadQuery` in the event handler for refreshing, so the network request starts immediately, and then pass the updated `queryRef` to the `MainContent` component that uses `usePreloadedQuery`, so it renders the updated data.
* We are passing a `fetchPolicy` of `'network-only'` to ensure that we always fetch from the network and skip the local data cache.
* Calling `loadQuery` will re-render the component and cause `usePreloadedQuery` to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)), since a network request will always be made due to the `fetchPolicy` we are using. This means that we'll need to make sure that there's a `Suspense` boundary wrapping the `MainContent` component in order to show a fallback loading state.

</OssOnly>

### If you need to avoid Suspense

In some cases, you might want to avoid showing a Suspense fallback, which would hide the already rendered content. For these cases, you can use [`fetchQuery`](../../../api-reference/fetch-query/) instead, and manually keep track of a loading state:

<FbInternalOnly>
  <FbAvoidSuspenseCaution />
</FbInternalOnly>

<OssOnly>
  <OssAvoidSuspenseNote />
</OssOnly>

```js
/**
 * App.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const environment = useRelayEnvironment();
  const [queryRef, loadQuery] = useQueryLoader<AppQueryType>(
    AppQuery,
    props.appQueryRef /* initial query ref */
  );
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(() => {
    if (isRefreshing) { return; }
    const {variables} = props.appQueryRef;
    setIsRefreshing(true);

    // fetchQuery will fetch the query and write
    // the data to the Relay store. This will ensure
    // that when we re-render, the data is already
    // cached and we don't suspend
    fetchQuery(environment, AppQuery, variables)
      .subscribe({
        complete: () => {
          setIsRefreshing(false);

          // *After* the query has been fetched, we call
          // loadQuery again to re-render with a new
          // queryRef.
          // At this point the data for the query should
          // be cached, so we use the 'store-only'
          // fetchPolicy to avoid suspending.
          loadQuery(variables, {fetchPolicy: 'store-only'});
        }
        error: () => {
          setIsRefreshing(false);
        }
      });
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        isRefreshing={isRefreshing}
        refresh={refresh}
        queryRef={queryRef}
      />
    </React.Suspense>
  );
}
```

Let's distill what's going on here:

* When refreshing, we now keep track of our own `isRefreshing` loading state, since we are avoiding supending. We can use this state to render a busy spinner or similar loading UI inside the `MainContent` component, *without* hiding the `MainContent`.
* In the event handler, we first call `fetchQuery`, which will fetch the query and write the data to the local Relay store. When the `fetchQuery` network request completes, we call `loadQuery` so that we obtain an updated  `queryRef` that we then pass to `usePreloadedQuery` in order render the updated data, similar to the previous example.
* At this point, when `loadQuery` is called, the data for the query should already be cached in the local Relay store, so we use `fetchPolicy` of `'store-only'` to avoid suspending and only read the already cached data.


## When using `useLazyLoadQuery`

To refresh a query using the [`useLazyLoadQuery`](../../../api-reference/use-lazy-load-query/) Hook described in our [Lazily Fetching Queries during Render](../../rendering/queries/#lazily-fetching-queries-during-render) section, we can do the following:

<FbInternalOnly>
  <FbRefreshingQueriesUsingUseLazyLoadQuery />
</FbInternalOnly>

<OssOnly>

```js
/**
 * App.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const variables = {id: '4'};
  const [refreshedQueryOptions, setRefreshedQueryOptions] = useState(null);

  const refresh = useCallback(() => {
    // Trigger a re-render of useLazyLoadQuery with the same variables,
    // but an updated fetchKey and fetchPolicy.
    // The new fetchKey will ensure that the query is fully
    // re-evaluated and refetched.
    // The fetchPolicy ensures that we always fetch from the network
    // and skip the local data cache.
    setRefreshedQueryOptions(prev => ({
      fetchKey: (prev?.fetchKey ?? 0) + 1,
      fetchPolicy: 'network-only',
    }));
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        refresh={refresh}
        queryOptions={refreshedQueryOptions ?? {}}
        variables={variables}
      />
    </React.Suspense>
  );
```

```js
/**
 * MainContent.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

// Fetches and renders the query, given the fetch options
function MainContent(props) {
  const {refresh, queryOptions, variables} = props;
  const data = useLazyLoadQuery<AppQueryType>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
          friends {
            count
          }
        }
      }
    `,
    variables,
    queryOptions,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        onClick={() => refresh()}>
        Fetch latest count
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We update the component in the event handler for refreshing by setting new options in state. This will cause the `MainContent` component that uses `useLazyLoadQuery` to re-render with the new `fetchKey` and `fetchPolicy`, and refetch the query upon rendering.
* We are passing a new value of `fetchKey` which we increment on every update. Passing a new `fetchKey` to `useLazyLoadQuery` on every update will ensure that the query is fully re-evaluated and refetched.
* We are passing a `fetchPolicy` of `'network-only'` to ensure that we always fetch from the network and skip the local data cache.
* The state update in `refresh` will cause the component to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)), since a network request will always be made due to the `fetchPolicy` we are using. This means that we'll need to make sure that there's a `Suspense` boundary wrapping the `MainContent` component in order to show a fallback loading state.

</OssOnly>

### If you need to avoid Suspense

In some cases, you might want to avoid showing a Suspense fallback, which would hide the already rendered content. For these cases, you can use [`fetchQuery`](../../../api-reference/fetch-query/) instead, and manually keep track of a loading state:

<FbInternalOnly>
  <FbAvoidSuspenseCaution />
</FbInternalOnly>

<OssOnly>
  <OssAvoidSuspenseNote />
</OssOnly>

```js
/**
 * App.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const variables = {id: '4'}
  const environment = useRelayEnvironment();
  const [refreshedQueryOptions, setRefreshedQueryOptions] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(() => {
    if (isRefreshing) { return; }
    setIsRefreshing(true);

    // fetchQuery will fetch the query and write
    // the data to the Relay store. This will ensure
    // that when we re-render, the data is already
    // cached and we don't suspend
    fetchQuery(environment, AppQuery, variables)
      .subscribe({
        complete: () => {
          setIsRefreshing(false);

          // *After* the query has been fetched, we update
          // our state to re-render with the new fetchKey
          // and fetchPolicy.
          // At this point the data for the query should
          // be cached, so we use the 'store-only'
          // fetchPolicy to avoid suspending.
          setRefreshedQueryOptions(prev => ({
            fetchKey: (prev?.fetchKey ?? 0) + 1,
            fetchPolicy: 'store-only',
          }));
        }
        error: () => {
          setIsRefreshing(false);
        }
      });
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        isRefreshing={isRefreshing}
        refresh={refresh}
        queryOptions={refreshedQueryOptions ?? {}}
        variables={variables}
      />
    </React.Suspense>
  );
}
```

Let's distill what's going on here:

* When refreshing, we now keep track of our own `isRefreshing` loading state, since we are avoiding supending. We can use this state to render a busy spinner or similar loading UI inside the `MainContent` component, *without* hiding the `MainContent`.
* In the event handler, we first call `fetchQuery`, which will fetch the query and write the data to the local Relay store. When the `fetchQuery` network request completes, we update our state so that we re-render an updated `fetchKey` and `fetchPolicy` that we then pass to `useLazyLoadQuery` in order render the updated data, similar to the previous example.
* At this point, when we update the state, the data for the query should already be cached in the local Relay store, so we use `fetchPolicy` of `'store-only'` to avoid suspending and only read the already cached data.

<DocsRating />
