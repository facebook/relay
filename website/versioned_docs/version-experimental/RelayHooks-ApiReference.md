---
id: version-experimental-api-reference
title: API Reference
original_id: api-reference
---
## Relay Hooks

**Relay Hooks** APIs are fully compatible with [React Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html). They are also fully compatible with [existing Relay APIs](https://relay.dev/docs/en/introduction-to-relay), meaning that they can be used together in the same application; Relay components will interop correctly regardless of whether they were written as Relay Hooks or as Relay containers.

For a usage guide, see: [**A Guided Tour of Relay**](a-guided-tour-of-relay).

For a full example using Relay Hooks and our integration with [Suspense for Data Fetching](https://reactjs.org/docs/concurrent-mode-suspense.html), check out [relay-examples/issue-tracker](https://github.com/relayjs/relay-examples/tree/master/issue-tracker).

### Benefits

* Using Hooks in general make for a somewhat simpler API; our hope is that the fact that they are functions that have specific inputs and outputs might be more clear than the “magic” that happens in Higher Order Components, where the prop you pass from above is not the same as the prop you receive inside the component.
* They also allow us to not pollute the React tree with multiple nested layers of Higher Order Components that wrap your actual components, which make them easier to inspect and debug in dev tools, and can help speed up React rendering.
* Hooks are also a lot simpler to Flow type, and with Relay Hooks we were able to guarantee better type safety than we could with our HOC / Renderer APIs.
* Relay Hooks have more capabilities compared to their container counterparts, for example by being integrated with [Suspense](a-guided-tour-of-relay#loading-states-with-suspense) for loading states, and providing new capabilities such as directly rendering data that is cached in the Relay store, which were previously not available.
* We also took the opportunity to simplify some of our APIs that were previously notoriously complicated, such as refetching and pagination. We've highlighted some of the main differences in those APIs in our documentation below ([Differences with RefetchContainer](#differences-with-refetchcontainer), [Differences with PaginationContainer](#differences-with-paginationcontainer)).
* Finally, Hooks were written to be compatible with React's Concurrent Mode, as opposed to our HOC / Renderer APIs which are unsafe to use in Concurrent Mode.

### Caveats

* Relay Hooks are integrated with [React Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html) and [Suspense](a-guided-tour-of-relay#loading-states-with-suspense), which means that they are designed to work in conjunction with apis like [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions). However, APIs like `useTransition` will not work as expected in React Legacy Mode (i.e. outside of Concurrent Mode), in particular when providing a timeout in a Suspense config; this affects apis like [`useBlockingPaginationFragment`](#useblockingpaginationfragment). For this reason, we recommend using Relay Hooks apis in Concurrent Mode.

* * *

### `RelayEnvironmentProvider`

This component is used set a Relay environment in React Context. Usually, a *single* instance of this component should be rendered at the very root of the application, in order to set the Relay environment for the whole application:

```javascript
const React = require('React');

const {RelayEnvironmentProvider} = require('react-relay/hooks');

function Root() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  );
}

module.exports = Root;
```

#### Props

* `environment`: The Relay environment to set in React Context. Any Relay Hooks (like [`useLazyLoadQuery`](#uselazyloadquery) or [useFragment](#usefragment)) used as descendants of this provider component will use the Relay environment specified here

#### Differences with current APIs

* In Relay Modern, we used the `QueryRenderer` component to both set an environment in Context and fetch a query. With Relay Hooks, these 2 concepts are separate: we use a single `RelayEnvironmentProvider` to set the environment in context for the whole application, and we can use one or more `useLazyLoadQuery` hooks to fetch any queries under the same environment set by the provider.



### `useRelayEnvironment`

Hook used to access a Relay environment that was set by a [`RelayEnvironmentProvider`](#relayenvironmentprovider):

```javascript
const React = require('React');

const {useRelayEnvironment} = require('react-relay/hooks');

function MyComponent() {
  const environment = useRelayEnvironment();

  const handler = useCallback(() => {
    // For example, can be used to pass the environment to functions
    // that require a Relay environment.
    commitMutation(environment, ...);
  }, [environment])

  return (...);
}

module.exports = Root;
```

### `usePreloadedQuery`

Hook used to access data fetched by an earlier call to `preloadQuery()`. This implements the "Render-as-You-Fetch" pattern:
* Call `preloadQuery()` *before* rendering to fetch the query results if necessary (see the [`preloadQuery()`](#preloadquery) for detailed behavior). This function is non-blocking and will fetch the results in the background.
* Then immediately render/update the application, calling `usePreloadedQuery()` to access the results of the `preloadQuery()` call.

`usePreloadedQuery()` will suspend if the query is still pending, throw an error if it failed, and otherwise return the query results. This pattern is encouraged over `useLazyLoadQuery()` as it can allow fetching data earlier while not blocking rendering.

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {graphql, preloadQuery, usePreloadedQuery} = require('react-relay/hooks');

const AppEnvironment = require('./AppEnvironment'); // user-defined

const query = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

// Note: call in an event-handler or similar, not during render
const result = preloadQuery(
  AppEnvironment,
  query,
  {id: '4'},
  {fetchPolicy: 'store-or-network'},
);

function App() {
  const data = usePreloadedQuery<AppQuery>(query, result);

  return <h1>{data.user?.name}</h1>;
}
```

#### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `preloadedQuery`: The result of calling [`preloadQuery()`](#preloadquery). Note that the same query should be used in the call to `preloadQuery()` and `usePreloadedQuery()`.

#### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

#### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified query.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| user: ?{| name: ?string |} |}`.

#### Behavior

* It is expected for `usePreloadedQuery` to have been rendered under a [`RelayEnvironmentProvider`](#relayenvironmentprovider), in order to access the correct Relay environment, otherwise an error will be thrown.
* Calling `usePreloadedQuery` will return the data for this query if the `preloadQuery()` call has completed. It will [*_suspend_*](a-guided-tour-of-relay#loading-states-with-suspense) while the network request is in flight. If `usePreloadedQuery` causes the component to suspend, you'll need to make sure that there's a `Suspense` ancestor wrapping this component in order to show the appropriate loading state. This hook will throw an error if the `preloadQuery()` fetch fails.
    * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.
* The component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.


### `useLazyLoadQuery`

Hook used to fetch a GraphQL query *during* render. Note that this pattern is generally not recommended: where possible, prefer [`preloadQuery()`](#preloadquery) and [`usePreloadedQuery()`](#usepreloadedquery) instead.

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');

const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    {id: 4},
    {fetchPolicy: 'store-or-network'},
  );

  return <h1>{data.user?.name}</h1>;
}
```

#### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.
* `options`: _*[Optional]*_ options object
    * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on the cached data that is currently available in the Relay store (for more details, see our [Fetch Policies](a-guided-tour-of-relay#fetch-policies) and [Garbage Collection](a-guided-tour-of-relay#garbage-collection-in-relay) guides):
        * **"store-or-network"**: _*(default)*_ ***will*** reuse locally cached data and will ***only*** send a network request if any data for the query is missing. If the query is fully cached, a network request will ***not*** be made.
        * **"store-and-network"**: ***will*** reuse locally cached data and will ***always*** send a network request, regardless of whether any data was missing from the local cache or not.
        * **"network-only"**: ***will not*** reuse locally cached data, and will ***always*** send a network request to fetch the query, ignoring any data that might be locally cached in Relay.
        * **"store-only"**: ***will only*** reuse locally cached data, and will ***never*** send a network request to fetch the query. In this case, the responsibility of fetching the query falls to the caller, but this policy could also be used to read and operate and data that is entirely [local](a-guided-tour-of-relay#local-data-updates).
    * `fetchKey`: A `fetchKey` can be passed to force a refetch of the current query and variables when the component re-renders, even if the variables didn't change, or even if the component isn't remounted (similarly to how passing a different `key` to a React component will cause it to remount). If the fetchKey is different from the one used in the previous render, the current query and variables will be refetched.
    * `networkCacheConfig`: _*[Optional]*_ Object containing cache config options for the ***network layer.*** Note the the network layer may contain an *additional* query response cache which will reuse network responses for identical queries. If you want to bypass this cache completely, pass `{force: true}` as the value for this option.

#### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

#### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified query.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| user: ?{| name: ?string |} |}`.

#### Behavior

* It is expected for `useLazyLoadQuery` to have been rendered under a [`RelayEnvironmentProvider`](#relayenvironmentprovider), in order to access the correct Relay environment, otherwise an error will be thrown.
* Calling `useLazyLoadQuery` will fetch and render the data for this query, and it may [*_suspend_*](a-guided-tour-of-relay#loading-states-with-suspense) while the network request is in flight, depending on the specified `fetchPolicy`, and whether cached data is available, or if it needs to send and wait for a network request. If `useLazyLoadQuery` causes the component to suspend, you'll need to make sure that there's a `Suspense` ancestor wrapping this component in order to show the appropriate loading state.
    * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.
* The component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
* After a component using `useLazyLoadQuery` has committed, re-rendering/updating the component **will not** cause the query to be fetched again.
    * If the component is re-rendered with ***different query variables,*** that will cause the query to be fetched again with the new variables, and potentially re-render with different data.
    * If the component ***unmounts and remounts***, that will cause the current query and variables to be refetched (depending on the `fetchPolicy`).

#### Differences with `QueryRenderer`

* `useLazyLoadQuery` no longer takes a Relay environment as a parameter, and thus no longer sets the environment in React Context, like `QueryRenderer` did. Instead, `useLazyLoadQuery` should be used as a descendant of a [**`RelayEnvironmentProvider`**](#relayenvironmentprovider), which now sets the Relay environment in Context. Usually, you should render a single `RelayEnvironmentProvider` at the very root of the application, to set a single Relay environment for the whole application.
* `useLazyLoadQuery` will use [Suspense](a-guided-tour-of-relay#loading-states-with-suspense) to allow developers to render loading states using Suspense boundaries, and will throw errors if network errors occur, which can be caught and rendered with Error Boundaries. This as opposed to providing error objects or null props to the `QueryRenderer` render function to indicate errors or loading states.
* `useLazyLoadQuery` fully supports fetch policies in order to reuse data that is cached in the Relay store instead of solely relying on the network response cache.
* `useLazyLoadQuery` has better type safety guarantees for the data it returns, which was not possible with QueryRenderer since we couldn't parametrize the type of the data with a renderer api.

### `useFragment`

```javascript
import type {**UserComponent_user$key**} from 'UserComponent_user.graphql';

const React = require('React');

const {graphql, useFragment} = require('react-relay/hooks');

type Props = {|
  user: UserComponent_user$key,
|};

function UserComponent(props: Props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name
        profile_picture(scale: 2) {
          uri
        }
      }
    `,
    props.user,
  );

  return (
    <>
      <h1>{data.name}</h1>
      <div>
        <img src={data.profile_picture?.uri} />
      </div>
    </>
  );
}
```

#### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal.
* `fragmentReference`: The ***fragment reference*** is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

#### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| name: ?string, profile_picture: ?{| uri: ?string |} |}`.

#### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.

### `useRefetchableFragment`

You can use `useRefetchableFragment` when you want to fetch and re-render a fragment with different data:

```javascript
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

const React = require('React');
const {useTransition} = require('React');

// RN or WWW:
const {graphql, useRefetchableFragment} = require('react-relay/hooks');


type Props = {|
  comment: CommentBody_comment$key,
|};

function CommentBody(props: Props) {
  const [startTransition] = useTransition();
  const [data, refetch] = useRefetchableFragment<CommentBodyRefetchQuery, _>(
    graphql`
      fragment CommentBody_comment on Comment
      @refetchable(queryName: "CommentBodyRefetchQuery") {
        body(lang: $lang) {
          text
        }
      }
    `,
    props.comment,
  );

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        onClick={() => {
          startTransition(() => {
            refetch({lang: 'SPANISH'}, {fetchPolicy: 'store-or-network'})}
          });
        }>
        Translate Comment
      </Button>
    </>
  );
}

module.exports = CommentBody;
```

#### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal. This fragment must have a **`@refetchable`** directive, otherwise using it will throw an error. The `@refetchable` directive can only be added to fragments that are “refetchable”, that is, on fragments that are declared on `Viewer` or  `Query` types, or on a type that implements `Node` (i.e. a type that has an `id`).
    * Note that you ***do not*** need to manually specify a refetch query yourself. The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`.
* `fragmentReference`: The ***fragment reference*** is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

#### Flow Type Parameters

* `TQuery`: Type parameter that should corresponds the Flow type for the `@refetchable` query. This type is available to import from the the auto-generated file: `<queryName>.graphql.js`.
* `TFragmentRef`: Type parameter corresponds to the type of the fragment reference argument (i.e. `<fragment_name>$key`). This type usually does not need to be explicitly specified, and can be passed as `_` to let Flow infer the concrete type.

#### Return Value

Tuple containing the following values

* [0] `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema.
* [1] `refetch`: Function used to refetch the fragment with a potentially new set of variables.
    * Arguments:
        * `variables`: Object containing the new set of variable values to be used to fetch the `@refetchable` query.
            * These variables need to match GraphQL variables referenced inside the fragment.
            * However, only the variables that are intended to change for the refetch request need to be specified; any variables referenced by the fragment that are omitted from this input will fall back to using the value specified in the original parent query. So for example, to refetch the fragment with the exact same variables as it was originally fetched, you can call `refetch({})`.
            * Similarly, passing an `id` value for the `$id` variable is _*optional*_, unless the fragment wants to be refetched with a different `id`. When refetching a `@refetchable` fragment, Relay will already know the id of the rendered object.
        * `options`: *_[Optional]_* options object
            * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on cached data that is available. See the [`useLazyLoadQuery`](#uselazyloadquery) section for full specification.
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the refetch request.
    * Behavior:
        * Calling `refetch` with a new set of variables will fetch the fragment again ***with the newly provided variables***. Note that the variables you need to provide are only the ones referenced inside the fragment. In this example, it means fetching the translated body of the currently rendered Comment, by passing a new value to the `lang` variable.
        * Calling `refetch` will re-render your component and may cause it to _*[suspend](a-guided-tour-of-relay#loading-states-with-suspense)*_, depending on the specified `fetchPolicy` and whether cached data is available or if it needs to send and wait for a network request. If refetch causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense Config ([Transitions and Updates that Suspend](a-guided-tour-of-relay#transitions-and-updates-that-suspend)) in order to show the appropriate pending or loading state.
            * Note that since `refetch` may cause the component to suspend, regardless of whether we are rendering a pending state, we should use `startTransition` from `useTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.
            * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.

#### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.

#### Differences with `RefetchContainer`

* A refetch query no longer needs to be specified in this api, since it will be automatically generated by Relay by using a `@refetchable` fragment.
* Refetching no longer has a distinction between `refetchVariables` and `renderVariables`, which were previously vaguely defined concepts. Refetching will always correctly refetch and render the fragment with the variables you provide (any variables omitted in the input will fallback to using the original values from the parent query).
* Refetching will unequivocally update the component, which was not always true when calling refetch from `RefetchContainer` (it would depend on what you were querying for in the refetch query and if your fragment was defined on the right object type).


### `usePaginationFragment`

You can use `usePaginationFragment` to render a fragment that uses a `@connection` and paginate over it:

```javascript
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsList_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: FriendsList_user$key,
|};

function FriendsList(props: Props) {
  const {
    data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch, // For refetching connection
  } = usePaginationFragment<FriendsListPaginationQuery, _>(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends") {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    props.user,
  );

  return (
    <>
      <h1>Friends of {data.name}:</h1>

      <List items={data.friends?.edges.map(edge => edge.node)}>
        {node => {
          return (
            <div>
              {node.name} - {node.age}
            </div>
          );
        }}
      </List>
      <Button onClick={() => loadMore(10)}>Load more friends</Button>
    </>
  );
}

module.exports = FriendsList;
```

#### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal.
    * This fragment must have an **`@connection`** directive on a connection field, otherwise using it will throw an error.
    * This fragment must have a **`@refetchable`** directive, otherwise using it will throw an error. The `@refetchable` directive can only be added to fragments that are “refetchable”, that is, on fragments that are declared on `Viewer` or  `Query` types, or on a type that implements `Node` (i.e. a type that has an `id`).
        * Note that you ***do not*** need to manually specify a pagination query yourself. The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`.
* `fragmentReference`: The ***fragment reference*** is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

#### Flow Type Parameters

* `TQuery`: Type parameter that should corresponds the Flow type for the `@refetchable` pagination query. This type is available to import from the the auto-generated file: `<queryName>.graphql.js`.
* `TFragmentRef`: Type parameter corresponds to the type of the fragment reference argument (i.e. `<fragment_name>$key`). This type usually does not need to be explicitly specified, and can be passed as `_` to let Flow infer the concrete type.

#### Return Value

Object containing the following properties:

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema.
* `isLoadingNext`: Boolean value which indicates if a pagination request for the *next* items in the connection is currently in flight, including any incremental data payloads.
* `isLoadingPrevious`: Boolean value which indicates if a pagination request for the *previous* items in the connection is currently in flight, including any incremental data payloads.
* `hasNext`: Boolean value which indicates if the end of the connection has been reached in the “forward” direction. It will be true if there are more items to query for available in that direction, or false otherwise.
* `hasPrevious`: Boolean value which indicates if the end of the connection has been reached in the “backward” direction. It will be true if there are more items to query for available in that direction, or false otherwise.
* `loadNext`: Function used to fetch more items in the connection in the “forward” direction.
    * Arguments:
        * `count`: Number that indicates how many items to query for in the pagination request.
        * `options`: *_[Optional]_* options object
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return Value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the pagination request.
    * Behavior:
        * Calling `loadNext`  ***will not*** cause the component to suspend. Instead, the `isLoadingNext` value will be set to true while the request is in flight, and the new items from the pagination request will be added to the connection, causing the component to re-render.
        * Pagination requests initiated from calling `loadNext` will *always* use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
* `loadPrevious`: Function used to fetch more items in the connection in the “backward” direction.
    * Arguments:
        * `count`: Number that indicates how many items to query for in the pagination request.
        * `options`: *_[Optional]_* options object
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return Value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the pagination request.
    * Behavior:
        * Calling `loadPrevious`  ***will not*** cause the component to suspend. Instead, the `isLoadingPrevious` value will be set to true while the request is in flight, and the new items from the pagination request will be added to the connection, causing the component to re-render.
        * Pagination requests initiated from calling `loadPrevious` will *always* use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
* `refetch`: Function used to refetch the connection fragment with a potentially new set of variables.
    * Arguments:
        * `variables`: Object containing the new set of variable values to be used to fetch the `@refetchable` query.
            * These variables need to match GraphQL variables referenced inside the fragment.
            * However, only the variables that are intended to change for the refetch request need to be specified; any variables referenced by the fragment that are omitted from this input will fall back to using the value specified in the original parent query. So for example, to refetch the fragment with the exact same variables as it was originally fetched, you can call `refetch({})`.
            * Similarly, passing an `id` value for the `$id` variable is _*optional*_, unless the fragment wants to be refetched with a different `id`. When refetching a `@refetchable` fragment, Relay will already know the id of the rendered object.
        * `options`: *_[Optional]_* options object
            * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on cached data that is available. See the [`useLazyLoadQuery`](#uselazyloadquery) section for full specification.
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the refetch request.
    * Behavior:
        * Calling `refetch` with a new set of variables will fetch the fragment again ***with the newly provided variables***. Note that the variables you need to provide are only the ones referenced inside the fragment. In this example, it means fetching the translated body of the currently rendered Comment, by passing a new value to the `lang` variable.
        * Calling `refetch` will re-render your component and may cause it to [*_suspend_*](a-guided-tour-of-relay#loading-states-with-suspense), depending on the specified `fetchPolicy` and whether cached data is available or if it needs to send and wait for a network request. If refetch causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense Config ([Transitions and Updates that Suspend](a-guided-tour-of-relay#transitions-and-updates)) in order to show the appropriate pending or loading state.
            * Note that since `refetch` may cause the component to suspend, regardless of whether we are rendering a pending state, we should use `startTransition` from `useTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.
            * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.

#### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](a-guided-tour-of-relay#loading-states-with-suspense) guide.
* Note that pagination (`loadNext` or `loadPrevious`), ***will not*** cause the component to suspend.

#### Differences with `PaginationContainer`

* A pagination query no longer needs to be specified in this api, since it will be automatically generated by Relay by using a `@refetchable` fragment.
* This api supports simultaneous bi-directional pagination out of the box.
* This api no longer requires passing a `getVariables` or `getFragmentVariables` configuration functions, like the `PaginationContainer` does.
    * This implies that pagination no longer has a between `variables` and `fragmentVariables`, which were previously vaguely defined concepts. Pagination requests will always use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
* This api no longer takes additional configuration like `direction` or `getConnectionFromProps` function (like Pagination Container does). These values will be automatically determined by Relay.
* Refetching no longer has a distinction between `variables` and `fragmentVariables`, which were previously vaguely defined concepts. Refetching will always correctly refetch and render the fragment with the variables you provide (any variables omitted in the input will fallback to using the original values in the parent query).
* Refetching will unequivocally update the component, which was not always true when calling `refetchConnection` from `PaginationContainer` (it would depend on what you were querying for in the refetch query and if your fragment was defined on the right object type).

### `useBlockingPaginationFragment`

**NOTE:** `useBlockingPaginationFragment` is meant to be used only in React Concurrent Mode, since it can't provide full Suspense capabilities outside of Concurrent Mode.

* * *

> WIP


In the meantime, see our **[Blocking ("all-at-once") Pagination Guide](a-guided-tour-of-relay#blocking-all-at-once-pagination)**.

### `useMutation`

You can use `useMutation` to execute a mutation in a React component.

```javascript
import type {FeedbackLikeMutation} from 'FeedbackLikeMutation.graphql';

const React = require('React');
const {graphql, useMutation} = require('react-relay/hooks');

function LikeButton() {
  const [commit, isInFlight] = useMutation<FeedbackLikeMutation>(graphql`
    mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
      feedback_like(data: $input) {
        feedback {
          id
          viewer_does_like
          like_count
        }
      }
    }
  `);
  if (isInFlight) {
    return <Spinner />;
  }
  return (
    <button
      onClick={() => {
        commit({
          variables: {
            input: {
              id: '123',
              text: 'text',
            },
          },
          onCompleted(data) {
            console.log(data);
          },
        });
      }}
    />
  );
}
```

#### Arguments

* `mutation`: GraphQL mutation specified using a `graphql` template literal.
* `commitMutationFn`: An optional function with the same signature as `commitMutation` to call in its stead.

#### Flow Type Parameters

* `TMutation`: Type parameter that should corresponds the Flow type for the mutation query. This type is available to import from the the auto-generated file: `<mutationName>.graphql.js`.

#### Return Value

Tuple containing the following values:

* [0] `commit`: The function that will execute the mutation
    * The parameter that `commit` accepts is almost the same as the second parameter to `commitMutation`.
        * `variables`: Object containing the variables needed for the mutation. For example, if the mutation defines an `$input` variable, this object should contain an `input` key, whose shape must match the shape of the data expected by the mutation as defined by the GraphQL schema. 
        * `onCompleted`: Callback function executed when the request is completed and the in-memory Relay store is updated with the `updater` function. Takes a `response` object, which is the "raw" server response.
        * `onError`: Callback function executed if Relay encounters an error while executing the request.
        * `optimisticResponse`: Object containing the data to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. This object must have the same shape as the mutation's response type, as defined by the GraphQL schema. If provided, Relay will use the `optimisticResponse` data to update the fields on the relevant records in the local data store, *before* `optimisticUpdater` is executed. If an error occurs during the mutation request, the optimistic update will be rolled back.
        * `optimisticUpdater`: Function used to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. If an error occurs during the mutation request, the optimistic update will be rolled back. This function takes a `store`, which is a proxy of the in-memory [Relay Store](https://relay.dev/docs/en/relay-store.html). In this function, the client defines how to update the local data via the store instance. For details on how to use the store, please refer to our [Relay Store API Reference](https://relay.dev/docs/en/relay-store.html). Please note:
            * It is usually preferable to just pass an `optimisticResponse` option instead of an `optimisticUpdater`, unless you need to perform updates on the local records that are more complicated than just updating fields (e.g. deleting records or adding items to collections).
            * If you do decide to use an `optimisticUpdater`, often times it can be the same function as `updater`.
        * `updater`: Function used to update the local in-memory store based on the real server response from the mutation. If `updater` is not provided, by default, Relay will know to automatically update the fields on the records referenced in the mutation response; however, you should pass an `updater` if you need to make more complicated updates than just updating fields (e.g. deleting records or adding items to collections). When the server response comes back, Relay first reverts any changes introduced by `optimisticUpdater` or `optimisticResponse` and will then execute updater. This function takes a store, which is a proxy of the in-memory [Relay Store](https://relay.dev/docs/en/relay-store.html). In this function, the client defines how to update the local data based on the server response via the store instance. For details on how to use the store, please refer to our [Relay Store API](https://relay.dev/docs/en/relay-store.html).
        *  Note: there is no environment argument. `useMutation` will automatically use the current environment provided by `RelayEnvironmentProvider`.
    * Return value:
        * disposable: Object containing a dispose function. Calling disposable.dispose() will revert the optimistic update, and Relay won’t update the store or call any success/error callback, but the network request is not guaranteed to be cancelled. If the dispose is called after the mutation has succeeded, it will not rollback the update in Relay store.
* [1] `areMutationsInFlight`: Will be true if any mutation triggered by calling `commit` is still in flight. If you call `commit` multiple times, there can be multiple mutations in flight at once.

### `useSubscription`

Hook used to subscribe and unsubscribe to a subscription.

```javascript
import {graphql, useSubscription} from 'RelayHooks';
import {useMemo} from 'react';

const subscription = graphql`subscription ...`;
function MyFunctionalComponent({ id }) {
  // IMPORTANT: your config should be memoized, or at least not re-computed
  // every render. Otherwise, useSubscription will re-render too frequently.
  const config = useMemo(() => { variables: { id }, subscription }, [id]);
  useSubscription(config);
  return (
    <div>Move Fast</div>
  );
}
```

This is a thin wrapper around the `requestSubscription` API. Its behavior:

* Create a subscription when the component is mounted with the given config
* Unsubscribe from that subscription when the component is unmounted

If you have the need to do something more complicated, such as imperatively requesting a subscription, please use the `requestSubscription` API directly.

#### Arguments

* `config`: the same config passed to `requestSubscription`


## Non-React APIs

### `preloadQuery`

This function is designed to be used with the `usePreloadedQuery()` hook to implement the "render-as-you-fetch" pattern in conjunction with `usePreloadedQuery`. See the [`usePreloadedQuery()`](#usepreloadedquery) docs for a more complete example.

```javascript
const {graphql, preloadQuery} = require('react-relay/hooks');

const AppEnvironment = require('./AppEnvironment'); // user-defined

const query = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

const result = preloadQuery(
  AppEnvironment,
  query,
  {id: '4'},
  {fetchPolicy: 'store-or-network'},
);

// later: pass result to usePreloadedQuery()
```

#### Arguments

* `environment`: A Relay Environment instance to execute the request on. If you're starting this request somewhere within a React component, you probably want to use the environment you obtain from using [`useRelayEnvironment`](#userelayenvironment).
* `query`: GraphQL query to fetch, specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.
* `options`: _*[Optional]*_ options object
    * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on the cached data that is currently available in the Relay store (for more details, see our [Fetch Policies](a-guided-tour-of-relay#fetch-policies) and [Garbage Collection](a-guided-tour-of-relay#garbage-collection-in-relay) guides):
        * **"store-or-network"**: _*(default)*_ ***will*** reuse locally cached data and will ***only*** send a network request if any data for the query is missing. If the query is fully cached, a network request will ***not*** be made.
        * **"store-and-network"**: ***will*** reuse locally cached data and will ***always*** send a network request, regardless of whether any data was missing from the local cache or not.
        * **"network-only"**: ***will not*** reuse locally cached data, and will ***always*** send a network request to fetch the query, ignoring any data that might be locally cached in Relay.
    * `fetchKey`: A `fetchKey` can be passed to force a refetch of the query and variables. `preloadQuery()` will cache requests while they are in-flight and for a brief duration afterwards, but using a distinct `fetchKey` can ensure that data is refetched (generally when used in conjunction with fetchPolicy=network-only).
    * `networkCacheConfig`: _*[Optional]*_ Object containing cache config options for the ***network layer.*** Note the the network layer may contain an *additional* query response cache which will reuse network responses for identical queries. If you want to bypass this cache completely, pass `{force: true}` as the value for this option.

#### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

#### Return Value

The exact format of the return value is *unstable and highly likely to change*. We strongly recommend not inspecting the contents in your code, as such code would be highly likely to break when upgrading to future versions of Relay. Instead, pass the result of `preloadQuery()` to `usePreloadedQuery()`.

### `fetchQuery`

If you want to fetch a query outside of React, you can use the **`fetchQuery`** function from `react-relay/hooks`:

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const {fetchQuery} = require('react-relay/hooks');

fetchQuery<AppQuery>(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 4},
)
.subscribe({
  start: () => {...},
  complete: () => {...},
  error: (error) => {...},
  next: (data) => {...}
});
```

#### Arguments

* `environment`: A Relay Environment instance to execute the request on. If you're starting this request somewhere within a React component, you probably want to use the environment you obtain from using [`useRelayEnvironment`](#userelayenvironment).
* `query`: GraphQL query to fetch, specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.
* `options`: *_[Optional]_* options object
    * `networkCacheConfig`: *_[Optional] _*Object containing cache config options
        * `force`: Boolean value. If true, will bypass the network response cache.

#### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

#### Return Value

* `observable`: Returns an observable instance. To start the request, `subscribe` or `toPromise` must be called on the observable. Exposes the following methods:
    * `susbcribe`: Function that can be called to subscribe to the observable for the network request
        * Arguments:
            * `observer`: Object that specifies observer functions for different events occurring on the network request observable. May specify the following event handlers as keys in the observer object:
                * `start`: Function that will be called when the network requests starts. It will receive a single `subscription` argument, which represents the subscription on the network observable.
                * `complete`: Function that will be called when the network request is complete
                * `next`: Function that will be called every time a payload is received from the network. It will receive a single `data` argument, which represents a snapshot of the query data read from the Relay store at the moment a payload was received from the server. The `next` function may be called multiple times when using Relay's [Incremental Data Delivery](#) capabilities to receive multiple payloads from the server.
                * `error`:  Function that will be called if an error occurs during the network request. It will receive a single `error` argument, containing the error that occurred.
                * `unsubscribe`: Function that will be called whenever the subscription is unsubscribed. It will receive a single `subscription` argument, which represents the subscription on the network observable.
        * Return Value:
            * `subscription`: Object representing a subscription to the observable. Calling `subscription.unsubscribe()` will cancel the network request.
    * `toPromise`:
        * Return Value:
            * `promise`: Returns a promise that will resolve when the network request fully completes. Cannot be canceled.

#### Behavior

* `fetchQuery` will automatically save the fetched data to the in-memory Relay store, and notify any components subscribed to the relevant data.
* `fetchQuery` will ***NOT*** retain the data for the query, meaning that it is not guaranteed that the data will remain saved in the Relay store at any point after the request completes. If you wish to make sure that the data is retained outside of the scope of the request, you need to call `environment.retain()` directly on the query to ensure it doesn't get deleted. See our section on [Controlling Relay's GC Policy](a-guided-tour-of-relay/#controlling-relays-garbage-collection-policy) for more details.
