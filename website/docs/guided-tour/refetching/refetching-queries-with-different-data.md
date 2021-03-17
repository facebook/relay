---
id: refetching-queries-with-different-data
title: Refetching Queries with Different Data
slug: /guided-tour/refetching/refetching-queries-with-different-data/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbRefetchingQueriesUsingUseQueryLoader from './fb/FbRefetchingQueriesUsingUseQueryLoader.md';
import FbRefetchingQueriesUsingUseLazyLoadQuery from './fb/FbRefetchingQueriesUsingUseLazyLoadQuery.md';
import FbAvoidSuspenseCaution from './fb/FbAvoidSuspenseCaution.md';
import OssAvoidSuspenseNote from './OssAvoidSuspenseNote.md';

When referring to **"refetching a query"**, we mean fetching the query again for *different* data than was originally rendered by the query. For example, this might be to change a currently selected item, to render a different list of items than the one being shown, or more generally to transition the currently rendered content to show new or different content.

## When using `useQueryLoader` / `loadQuery`

Similarly to [Refreshing Queries with `useQueryLoader`](../refreshing-queries/#when-using-usequeryloader--loadquery), we can also use the `useQueryLoader` Hook described in our [Fetching Queries for Render](../../rendering/queries/#fetching-queries-for-render) section, but this time passing *different query variables*:

<FbInternalOnly>
  <FbRefetchingQueriesUsingUseQueryLoader />
</FbInternalOnly>

<OssOnly>

```js
/**
 * App.react.js
 */
const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const variables = {id: '4'};
  const [queryRef, loadQuery] = useQueryLoader<AppQueryType>(
    AppQuery,
    props.appQueryRef /* initial query ref */
  );

  const refetch = useCallback(() => {
    // Load the query again using the same original variables.
    // Calling loadQuery will update the value of queryRef.
    loadQuery({id: 'different-id'});
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        refetch={refetch}
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
  const {refetch, queryRef} = props;
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
      <div>Friends count: {data.user?.friends?.count}</div>
      <Button
        onClick={() => refetch()}>
        Fetch latest count
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We call `loadQuery` in the event handler for refetching, so the network request starts immediately, and then pass the `queryRef` to `usePreloadedQuery`, so it renders the updated data.
* We are not passing a `fetchPolicy` to `loadQuery`, meaning that it will use the default value of `'store-or-network'`. We could provide a different policy in order to specify whether to use locally cached data (as we covered in [Reusing Cached Data For Render](../../reusing-cached-data/)).
* Calling `loadQuery` will re-render the component and may cause `usePreloadedQuery` to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)). This means that we'll need to make sure that there's a `Suspense` boundary wrapping the `MainContent` component, in order to show a fallback loading state.

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
  const [isRefetching, setIsRefetching] = useState(false)

  const refetch = useCallback(() => {
    if (isRefetching) { return; }
    setIsRefetching(true);

    // fetchQuery will fetch the query and write
    // the data to the Relay store. This will ensure
    // that when we re-render, the data is already
    // cached and we don't suspend
    fetchQuery(environment, AppQuery, variables)
      .subscribe({
        complete: () => {
          setIsRefetching(false);

          // *After* the query has been fetched, we call
          // loadQuery again to re-render with a new
          // queryRef.
          // At this point the data for the query should
          // be cached, so we use the 'store-only'
          // fetchPolicy to avoid suspending.
          loadQuery({id: 'different-id'}, {fetchPolicy: 'store-only'});
        }
        error: () => {
          setIsRefetching(false);
        }
      });
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        isRefetching={isRefetching}
        refetch={refetch}
        queryRef={queryRef}
      />
    </React.Suspense>
  );
}
```

Let's distill what's going on here:

* When refetching, we now keep track of our own `isRefetching` loading state, since we are avoiding supending. We can use this state to render a busy spinner or similar loading UI inside the `MainContent` component, *without* hiding the `MainContent`.
* In the event handler, we first call `fetchQuery`, which will fetch the query and write the data to the local Relay store. When the `fetchQuery` network request completes, we call `loadQuery` so that we obtain an updated `queryRef` that we then pass to `usePreloadedQuery` in order render the updated data, similar to the previous example.
* At this point, when `loadQuery` is called, the data for the query should already be cached in the local Relay store, so we use `fetchPolicy` of `'store-only'` to avoid suspending and only read the already cached data.

## When using `useLazyLoadQuery`

Similarly to [Refreshing Queries with `useLazyLoadQuery`](../refreshing-queries/#when-using-uselazyloadquery), we can also use the [`useLazyLoadQuery`](../../../api-reference/use-lazy-load-query/) Hook described in our [Lazily Fetching Queries during Render](../../rendering/queries/#lazily-fetching-queries-during-render) section, but this time passing *different query variables*:

<FbInternalOnly>
  <FbRefetchingQueriesUsingUseLazyLoadQuery />
</FbInternalOnly>

<OssOnly>

```js
/**
 * App.react.js
 */
import type {AppQuery as AppQueryType} from 'AppQuery.graphql';

const AppQuery = require('__generated__/AppQuery.graphql');

function App(props: Props) {
  const [queryArgs, setQueryArgs] = useState({
    options: {fetchKey: 0},
    variables: {id: '4'},
  });

  const refetch = useCallback(() => {
    // Trigger a re-render of useLazyLoadQuery with new variables,
    // *and* an updated fetchKey.
    // The new fetchKey will ensure that the query is fully
    // re-evaluated and refetched.
    setQueryArgs(prev => ({
      options: {
        fetchKey: (prev?.fetchKey ?? 0) + 1,
      },
      variables: {id: 'different-id'}
    }));
  }, [/* ... */]);

  return (
    <React.Suspense fallback="Loading query...">
      <MainContent
        refetch={refetch}
        queryArgs={queryArgs}
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

// Fetches and renders the query, given the fetch options
function MainContent(props) {
  const {refetch, queryArgs} = props;
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
    queryArgs.variables,
    queryArgs.options,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        onClick={() => refetch()}>
        Fetch latest count
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* We update the component in the event handler for refreshing by setting new query args in state. This will cause the `MainContent` component that uses `useLazyLoadQuery` to re-render with the new `variables` and  `fetchKey`, and refetch the query upon rendering.
* We are passing a new value of `fetchKey` which we increment on every update. Passing a new `fetchKey` to `useLazyLoadQuery` on every update will ensure that the query is fully re-evaluated and refetched.
* We are not passing a new `fetchPolicy` to `useLazyLoadQuery`, meaning that it will use the default value of `'store-or-network'`. We could provide a different policy in order to specify whether to use locally cached data (as we covered in [Reusing Cached Data For Render](../../reusing-cached-data/)).
* The state update in `refetch` will re-render the component and may cause the component to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)). This means that we'll need to make sure that there's a `Suspense` boundary wrapping the `MainContent` component, in order to show a fallback loading state.


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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [queryArgs, setQueryArgs] = useState({
    options: {fetchKey: 0, fetchPolicy: 'store-or-network'},
    variables: {id: '4'},
  });

  const refetch = useCallback(() => {
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
          setQueryArgs(prev => ({
            options: {
              fetchKey: (prev?.fetchKey ?? 0) + 1,
              fetchPolicy: 'store-only',
            },
            variables: {id: 'different-id'}
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
        isRefetching={isRefetching}
        refetch={refetch}
        queryArgs={queryArgs}
      />
    </React.Suspense>
  );
}
```

Let's distill what's going on here:

* When refetching, we now keep track of our own `isRefetching` loading state, since we are avoiding supending. We can use this state to render a busy spinner or similar loading UI inside the `MainContent` component, *without* hiding the `MainContent`.
* In the event handler, we first call `fetchQuery`, which will fetch the query and write the data to the local Relay store. When the `fetchQuery` network request completes, we update our state so that we re-render an updated `fetchKey` and `fetchPolicy` that we then pass to `useLazyLoadQuery` in order render the updated data, similar to the previous example.
* At this point, when we update the state, the data for the query should already be cached in the local Relay store, so we use `fetchPolicy` of `'store-only'` to avoid suspending and only read the already cached data.


<DocsRating />
