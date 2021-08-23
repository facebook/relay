---
id: queries
title: Queries
slug: /guided-tour/rendering/queries/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

import FbEntrypointsExtraInfo from './fb/FbEntrypointsExtraInfo.md';

A [GraphQL Query](https://graphql.org/learn/queries/) is a description of data you want to query from a GraphQL server. It consists of a set of fields (and potentially [fragments](../fragments/)) that we want to request from the GraphQL server. What we can query for will depend on the [GraphQL Schema](https://graphql.org/learn/schema/) exposed on the server, which describes the data that is available for querying.

A query can be sent as a request over the network, along with an optional collection of [variables](../variables/) that the query uses, in order to fetch the data. The server response will be a JSON object that matches the shape of the query we sent:

```graphql
query UserQuery($id: ID!) {
  user(id: $id) {
    id
    name
    ...UserFragment
  }
  viewer {
    actor {
      name
    }
  }
}

fragment UserFragment on User {
  username
}
```

<FbInternalOnly>

[Sample response](https://fburl.com/graphiql/v5hs717f):

</FbInternalOnly>

<OssOnly>

Sample response:

</OssOnly>

```json
{
  "data": {
    "user": {
      "id": "4",
      "name": "Mark Zuckerberg",
      "username": "zuck"
    },
    "viewer": {
      "actor": {
        "name": "Your Name"
      }
    }
  }
}
```



## Rendering Queries

To *render* a query in Relay, you can use the `usePreloadedQuery` hook. `usePreloadedQuery` takes a query definition and a query reference, and returns the corresponding data for that query and reference.

```js
import type {HomeTabQuery} from 'HomeTabQuery.graphql';

const React = require('React');
const {graphql, usePreloadedQuery} = require('react-relay');

type Props = {
  queryRef: PreloadedQuery<HomeTabQuery>,
};

function HomeTab(props: Props) {
  const data = usePreloadedQuery<HomeTabQuery>(
    graphql`
      query HomeTabQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    props.queryRef,
  );

  return (
    <h1>{data.user?.name}</h1>
  );
}
```

Lets see what's going on here:

* `usePreloadedQuery`  takes a `graphql` query and a `PreloadedQuery` reference, and returns the data that was fetched for that query.
    * The `PreloadedQuery` (in this case `queryRef`) is an object that describes and references an *instance* of our query that is being (or was) fetched.
        * We'll cover how to actually fetch the query in the next section below, and cover how to show loading states if the query is in-flight when we try to render it in the [Loading States with Suspense](../loading-states/) section.
    * Note that the `PreloadedQuery` type takes a Flow type parameter, which corresponds to the Flow type for the query, in this case `HomeTabQuery`.
* Similarly to [fragments](../fragments/), *the component is automatically subscribed to updates to the query data*: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
* `usePreloadedQuery` also additionally takes a Flow type parameter, which corresponds to the Flow type for the query, in this case `HomeTabQuery`.
    * Remember that Relay automatically generates Flow types for any declared queries, which are available to import from the generated files with the following name format: *`<query_name>`*`.graphql.js`.
    * Note that the `data` is already properly Flow typed without requiring an explicit annotation, and is based on the types from the GraphQL schema. For example, the type of `data` above would be: `{ user: ?{ name: ?string } }`.
* Make sure you're providing a Relay environment using a [Relay Environment Provider](../environment/) at the root of your app before trying to render a query.


## Fetching Queries for Render

Apart from *rendering* a query, we also need to fetch it from the server. Usually we want to fetch queries somewhere at the root of our app, and only have **one or a few queries that [*accumulate*](../fragments/#composing-fragments-into-queries) all the data required to render the screen**. Ideally, we'd fetch them as early as possible, before we even start rendering our app.

In order to *fetch* a query for later rendering it, you can use the `useQueryLoader` Hook:

```js
import type {HomeTabQuery as HomeTabQueryType} from 'HomeTabQuery.graphql';
import type {PreloadedQuery} from 'react-relay';

const HomeTabQuery = require('HomeTabQuery.graphql')
const {useQueryLoader} = require('react-relay');


type Props = {
  initialQueryRef: PreloadedQuery<HomeTabQueryType>,
};

function AppTabs(props) {
  const [
    homeTabQueryRef,
    loadHomeTabQuery,
  ] = useQueryLoader<HomeTabQueryType>(
    HomeTabQuery,
    props.initialQueryRef, /* e.g. provided by router */
  );

  const onSelectHomeTab = () => {
    // Start loading query for HomeTab immediately in the event handler
    // that triggers navigation to that tab, *before* we even start
    // rendering the target tab.
    // Calling this function will update the value of homeTabQueryRef.
    loadHomeTabQuery({id: '4'});

    // ...
  }

  // ...

  return (
    screen === 'HomeTab' && homeTabQueryRef != null ?
      // Pass to component that uses usePreloadedQuery
      <HomeTab queryRef={homeTabQueryRef} /> :
      // ...
  );
}
```

The example above is somewhat contrived, but let's distill what is happening:

* We are calling `useQueryLoader` inside our `AppTabs` component.
    * It takes a query, which in this case is our `HomeTabQuery` (the query that we declared in our previous example), and which we can obtain by requiring the auto-generated file: `‘HomeTabQuery.graphql'`.
    * It takes an optional initial `PreloadedQuery` to be used as the initial value of the `homeTabQueryRef` that is stored in state and returned by `useQueryLoader`.
    * It also additionally takes a Flow type parameter, which corresponds to the Flow type for the query, in this case `HomeTabQueryType`, which you can also obtain from the auto-generated file: `‘HomeTabQuery.graphql'`.
* Calling `useQueryLoader` allows us to obtain 2 things:
    * `homeTabQueryRef`: A `?PreloadedQuery`, which is an object that describes and references an *instance* of our query that is being (or was) fetched. This value will be null if we haven't fetched the query, i.e. if we haven't called `loadHomeTabQuery`.
    * `loadHomeTabQuery`: A function that will *fetch* the data for this query from the server (if it isn't already cached), and given an object with the [variables](../variables/) the query expects, in this case `{id: '4'}` (we'll go into more detail about how Relay uses cached data in the [Reusing Cached Data For Render](../../reusing-cached-data/) section). Calling this function will also update the value of `homeTabQueryRef` to an instance of a `PreloadedQuery`.
        * Note that the `variables` we pass to this function will be checked by Flow to ensure that you are passing values that match what the GraphQL query expects.
        * Also note that we are calling this function in the event handler that causes the `HomeTab` to be rendered. This allows us to start fetching the data for the screen as early as possible, even before the new tab starts rendering.
            * In fact, note that this function can NOT be called during render; it *must* be called outside of a Component's render function, otherwise it will produce an error.
* Note that `useQueryLoader` will automatically dispose of all queries that have been loaded when the component unmounts. Disposing of a query means that Relay will no longer hold on to the data for that particular instance of the query in its cache (we'll cover the lifetime of query data in [Reusing Cached Data For Render](../../reusing-cached-data/) section). Additionally, if the request for the query is still in flight when disposal occurs, it will be canceled.
* Our `AppTabs` component renders the `HomeTab` component from the previous example, and passes it the corresponding query reference. Note that this parent component owns the lifetime of the data for that query, meaning that when it unmounts, it will of dispose of that query, as mentioned above.
* Finally, make sure you're providing a Relay environment using a [Relay Environment Provider](../environment/) at the root of your app before trying to use `useQueryLoader`.


Sometimes, you want to start a fetch outside of the context of a parent component, for example to fetch the data required for the initial load of the application. For these cases, you can use the `loadQuery` API directly, without using `useQueryLoader`:

```js
import type {HomeTabQuery as HomeTabQueryType} from 'HomeTabQuery.graphql';

const HomeTabQuery = require('HomeTabQuery.graphql')
const {loadQuery} = require('react-relay');


const environment = createEnvironment(...);

// At some point during app initialization
const initialQueryRef = loadQuery<HomeTabQueryType>(
  environment,
  HomeTabQuery,
  {id: '4'},
);

// ...

// E.g. passing the initialQueryRef to the root component
render(<AppTabs initialQueryRef={initialQueryRef} initialTab={...} />)
```

* In this example, we are calling the `loadQuery` function directly to obtain a `PreloadedQuery` instance that we can later pass to a component that uses `usePreloadedQuery`.
* In this case, we would expect the root `AppTabs` component to manage the lifetime of the query reference, and dispose of it at the appropriate time, if at all.
* We've left the details of "app initialization" vague in this example, since that will vary from application to application. The important thing to note here is that we should obtain a query reference before we start rendering the root component. Specifically, `loadQuery` can NOT be called during render; it must be called outside of a Component's render function, otherwise it will produce an error.


### Render as you Fetch

The examples above illustrate how to separate fetching the data from rendering it, in order to start the fetch as early as possible (as opposed to waiting until the component is rendered to start the fetch), and allow us to show content to our users a lot sooner. It also helps prevent waterfalling round trips, and gives us more control and predictability over when the fetch occurs, whereas if we fetch during render, it becomes harder to determine when the fetch will (or should) occur. This fits nicely with the [*"render-as-you-fetch"*](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) pattern with [React Suspense](../loading-states/).

This is the preferred pattern for fetching data with Relay, and it applies in several circumstances, such as the initial load of an application, during subsequent navigations, or generally when using UI elements which are initially hidden and later revealed upon an interaction (such as menus, popovers, dialogs, etc), and which also require fetching additional data.

<FbEntrypointsExtraInfo />


## Lazily Fetching Queries during Render

Another alternative for fetching a query is to lazily fetch the query when the component is rendered. However, as we've mentioned previously, the preferred pattern is to start fetching queries ahead of rendering. If lazy fetching is used without caution, it can trigger nested or waterfalling round trips, and can degrade performance.

To fetch a query lazily, you can use the `useLazyLoadQuery` Hook:

```js
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    {id: '4'},
  );

  return (
    <h1>{data.user?.name}</h1>
  );
}
```
Lets see what's going on here:

* `useLazyLoadQuery`  takes a graphql query and some variables for that query, and returns the data that was fetched for that query. The variables are an object containing the values for the [variables](../variables/) referenced inside the GraphQL query.
* Similarly to [fragments](../fragments/), the component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
* `useLazyLoadQuery` additionally  takes a Flow type parameter which corresponds to the Flow type for the query, in this case AppQuery.
    * Remember that Relay automatically generates Flow types for any declared queries, which you can import and use with `useLazyLoadQuery`. These types are available in the generated files with the following name format: `<query_name>.graphql.js`.
    * Note that the `variables` will be checked by Flow to ensure that you are passing values that match what the GraphQL query expects.
    * Note that the data is already properly Flow typed without requiring an explicit annotation, and is based on the types from the GraphQL schema. For example, the type of `data` above would be: `{ user: ?{ name: ?string } }`.
* By default, when the component renders, Relay will *fetch* the data for this query (if it isn't already cached), and return it as a the result of the `useLazyLoadQuery` call. We'll go into more detail about how to show loading states in the [Loading States with Suspense](../loading-states/) section, and how Relay uses cached data in the [Reusing Cached Data For Rendering](../../reusing-cached-data/) section.
* Note that if you re-render your component and pass *different query variables* than the ones originally used, it will cause the query to be fetched again with the new variables, and potentially re-render with different data.
* Finally, make sure you're providing a Relay environment using a [Relay Environment Provider](../../../api-reference/relay-environment-provider/) at the root of your app before trying to render a query.


<DocsRating />
