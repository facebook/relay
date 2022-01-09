---
id: relay-hooks-and-legacy-container-apis
title: Relay Hooks and Legacy Container APIs
slug: /migration-and-compatibility/relay-hooks-and-legacy-container-apis/
description: Relay guide to compatibility between hooks and containers
keywords:
- migration
- compatibility
- container
- QueryRenderer
- FragmentContainer
- RefetchContainer
- PaginationContainer
---

import DocsRating from '@site/src/core/DocsRating';

## Compatibility between Relay Hooks and Containers

Relay Hooks are fully compatible with Relay's [container-based APIs](../../api-reference/legacy-apis/), meaning that containers can render components that use Hooks, and vice-versa.

This means that you can adopt Relay Hooks incrementally, either by using them exclusively for new code, or by migrating specific parts of your app, without affecting the rest of your existing application.


## Migrating existing container-based code

As we've mentioned, migrating existing code to Relay Hooks is ***not*** required, and **container-based code will continue to work**.

However, in this section we will go over common migration patterns you can follow if you do choose to migrate container-based code to Relay Hooks.


### `QueryRenderer` → `useLazyLoadQuery`

Converting from a `QueryRenderer` to the [`useLazyLoadQuery`](../../api-reference/use-lazy-load-query/) Hook is the most straightforward conversion, and will have a similar behavior of fetching the specified query *during render.*

To convert a `QueryRenderer` to `useLazyLoadQuery`, you need to take the following steps:

1. Render a [`RelayEnvironmentProvider`](../../api-reference/relay-environment-provider/) where the QueryRenderer was, or above it. Usually, we recommend rendering the `RelayEnvironmentProvider` at the very root of your app:

```js
<RelayEnvironmentProvider environment={MyAppEnvironment}>
  <App />
</RelayEnvironmentProvider>
```


2. Convert the `QueryRenderer` into `useLazyLoadQuery`:

**Before:**

```js
import * as React from 'React';
import {graphql, QueryRenderer} from 'react-relay';

export default function Home() {
  return (
    <QueryRenderer
      environment={MyAppEnvironment}
      query={graphql`
        query HomeQuery($id: ID!) {
          user(id: $id) {
            name
          }
        }
      `}
      variables={{id: 4}}
      render={(props, error) => {
        if (error) {
          return <Error />;
        }
        if (!props) {
          return <Loading />;
        }
        return <h1>{props.user?.name}</h1>
      }}
    />
  );
}
```


**After:**
Fetch and render the query:

```js
import * as React from 'React';
import {graphql, useLazyLoadQuery} from 'react-relay';

export default function Home() {
  const data = useLazyLoadQuery(
    graphql`
      query HomeQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    {id: 4},
  );

 return <h1>{data.user?.name}</h1>;
}
```

[Loading states](../../guided-tour/rendering/loading-states/) and [error states](../../guided-tour/rendering/error-states/) are handled by Suspense and Error Boundaries:

```js
<ErrorBoundary renderError={Error}>
  <Suspense fallback={<Loading />}>
    <Home />
  </Suspense>
</ErrorBoundary>
```



### `QueryRenderer` → `useQueryLoader` + `usePreloadedQuery`

Unlike `useLazyLoadQuery`, using [`useQueryLoader`](../../api-reference/use-query-loader/) in combination with [`usePreloadedQuery`](../../api-reference/use-preloaded-query/) will start fetching the data *ahead* of render, following the "render-as-you-fetch" pattern. This means that the data fetch will start sooner, and potentially speed up the time it takes to show content to users.

To make best use of this pattern, query loading is usually integrated at the router level, or other parts of your UI infra. To see a full example, see our [`issue-tracker`](https://github.com/relayjs/relay-examples/blob/main/issue-tracker/src/routes.js) example app.


To convert a `QueryRenderer` to `useQueryLoader`, you need to take the following steps:

1. Render a [`RelayEnvironmentProvider`](../../api-reference/relay-environment-provider/) where the QueryRenderer was, or above it. Usually, we recommend rendering the `RelayEnvironmentProvider` at the very root of your app:

```js
<RelayEnvironmentProvider environment={MyAppEnvironment}>
  <App />
</RelayEnvironmentProvider>
```

2. Convert the `QueryRenderer` into `useQueryLoader` + `usePreloadedQuery`:

**Before:**

```js
import * as React from 'React';
import {graphql, QueryRenderer} from 'react-relay';

export default function UserPopover() {
  return (
    <QueryRenderer
      environment={MyAppEnvironment}
      query={graphql`
        query UserPopoverQuery($id: ID!) {
          user(id: $id) {
            name
          }
        }
      `}
      variables={{id: 4}}
      render={(props, error) => {
        if (error) {
          return <Error />;
        }
        if (!props) {
          return <Loading />;
        }
        return <h1>{props.user?.name}</h1>
      }}
    />
  );
}
```


**After:**
Render the preloaded query:

```js
import * as React from 'React';
import {graphql, usePreloadedQuery} from 'react-relay';

export default function UserPopover(props) {
  const data = usePreloadedQuery(
    graphql`
      query UserPopoverQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    props.queryRef,
  );

 return <h1>{data.user?.name}</h1>;
}
```


Load the query with `loadQuery` from `useQueryLoader`. This part of the code would usually be integrated in your routing, or other parts of your UI infra:

```js
import * as React from 'React';
import {useQueryLoader} from 'react-relay';

// Import the query defined in the UserPopover component
import UserPopoverQuery from '__generated__/UserPopoverQuery.graphql';

// This is *NOT* a real-world example, only used
// to illustrate usage.

export default function UserPopoverButton(props) {
  const [queryRef, loadQuery] = useQueryLoader(UserPopoverQuery)

  const handleClick = useCallback(() => {
    // Load the query in the event handler, onClick
    loadQuery({id: props.userID})
  }, [loadQuery, props.userID]);

  return (
    <>
      <Button onClick={handleClick} />
      {queryRef != null ?
        <Popover>

          {/* Loading and error states are handled by
          Suspense and Error Boundaries */}
          <ErrorBoundary renderError={Error}>
            <Suspense fallback={<Loading />}>

              {/*Pass the queryRef*/}
              <UserPopover queryRef={queryRef} />

            </Suspense>
          </ErrorBoundary>
        </Popover>
        : null
      }
    </>
  );
}
```



### Fragment Container → `useFragment`

Fragment Containers will map directly into a [`useFragment`](../../api-reference/use-fragment/) call:

**Before:**

```js
import * as React from 'React';
import {graphql, createFragmentContainer} from 'react-relay';

function UserComponent(props: Props) {
  const user = props.user;
  return (
    <>
      <h1>{user.name}</h1>
      <div>
        <img src={user.profile_picture?.uri} />
      </div>
    </>
  );
}

export default createFragmentContainer(UserComponent, {
  user: graphql`
    fragment UserComponent_user on User {
      name
      age
      profile_picture(scale: 2) {
        uri
      }
    }
  `,
});
```


**After:**

```js
import * as React from 'React';
import {graphql, useFragment} from 'react-relay';

export default function UserComponent(props: Props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name
        profile_picture(scale: $scale) {
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



### Refetch Container → `useRefetchableFragment`

The refetch API for [`useRefetchableFragment`](../../api-reference/use-refetchable-fragment/) has been simplified and reduced compared to the former Refetch Container. Migration will require mapping inputs into the new API.

**Before:**

```js
import * as React from 'React';
import {graphql, createRefetchContainer} from 'react-relay';

function CommentBody(props: Props) {
  const relay = props.relay;

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        onClick={() => relay.refetch(
          {lang: 'SPANISH'}, // fragmentVariables
          null,  // renderVariables
          error => { ... },
          {force: true}
        )}>
        Translate Comment
      </Button>
    </>
  );
}

export default createRefetchContainer(
  CommentBody,
  {
    user: graphql`
      fragment CommentBody_comment on Comment {
        body(lang: $lang) {
          text
        }
      }
    `,
  },

  // This option is no longer required, the refetch query
  // will automatically be generated by Relay using the @refetchable
  // directive.
  graphql`
    query AppQuery($id: ID!, lang: Lang) {
      node(id: $id) {
        ...CommentBody_comment
      }
    }
  `,
);
```

**After:**

```js
import * as React from 'React';
import {graphql, useRefetchableFragment} from 'react-relay';

export default function CommentBody(props: Props) {
  const [data, refetch] = useRefetchableFragment(
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

  const handleClick = useCallback(() => {
    refetch({lang: 'SPANISH'});
  }, [refetch]);

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        onClick={handleClick}>
        Translate Comment
      </Button>
    </>
  );
}
```



### Pagination Container → `usePaginationFragment`

The pagination API for [`usePaginationFragment`](../../api-reference/use-pagination-fragment/) has been greatly simplified and reduced compared to the former PaginationContainer. Migration will require mapping inputs into the new API.

**Before:**

```js
import * as React from 'React';
import {graphql, createPaginationContainer} from 'react-relay';

class UserContainerComponent extends React.Component {
  render(): React.Node {
    const isLoading = this.props.relay.isLoading() || this.state.loading;
    const hasMore = this.props.relay.hasMore();

    return (
      <>
        <FriendsList friends={this.props.user?.friends} />
        <Button
          onClick={() => this.loadMore()}
          disabled={!hasMore || isLoading}>
          Load More
          {isLoading && <InlineSpinner />}
        </Button>
      </>
    );
  }

  loadMore() {
    if (
      !this.props.relay.hasMore() ||
      this.props.relay.isLoading() ||
      this.state.loading
    ) {
      return;
    }

    this.setState({loading: true});

    this.props.relay.loadMore(5, () => this.setState({loading: false}));
  }
}

export default createPaginationContainer(
  UserContainerComponent,
  {
    user: graphql`
      fragment UserContainerComponent_user on User
      @argumentDefinitions(count: {type: "Int!"}, cursor: {type: "ID"})
      @refetchable(queryName: "UserComponentRefetchQuery") {
        friends(first: $count, after: $cursor)
          @connection(key: "UserComponent_user_friends") {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
  },
  {
    // This option is no longer necessary, usePaginationFragment supports
    // bi-directional pagination out of the box.
    direction: 'forward',

    // This option is no longer required, and will be automatically
    // determined by usePaginationFragment
    getConnectionFromProps(props: Props) {
      return props.user?.friends;
    },

    // This option is no longer required, and will be automatically
    // determined by usePaginationFragment
    getFragmentVariables(vars, count) {
      return {...vars, count};
    },

    // This option is no longer required, and will be automatically
    // determined by usePaginationFragment
    getVariables(props: Props, {count, cursor}) {
      return {
        cursor,
        count,
      };
    },

    // This option is no longer required, the pagination query
    // will automatically be generated by Relay using the @refetchable
    // directive.
    query: graphql`
      query UserContainerComponentQuery {
        viewer {
          actor {
            ... on User {
              ...UserContainerComponent_user @arguments(count: 10)
            }
          }
        }
      }
    `,
  },
);
```


**After:**

```js
import * as React from 'React';
import {graphql, usePaginationFragment} from 'react-relay';

export default function UserComponent(props: Props) {
  const {data, loadNext, hasNext, isLoadingNext} = usePaginationFragment(
    graphql`
      fragment UserComponent_user on User
      @refetchable(queryName: "UserComponentRefetchQuery") {
        friends(first: $count, after: $after)
          @connection(key: "UserComponent_user_friends") {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    props.user,
  );

  const handleClick = useCallback(() => {
    loadNext(5)
  }, [loadNext])

  return (
    <>
      <FriendsList friends={data?.friends?.edges} />
      <Button onClick={handleClick} disabled={!hasNext || isLoadingNext}>
        Load More
        {isLoadingNext && <InlineSpinner />}
      </Button>
    </>
  );
}
```




* * *

### QueryRenderer → useEntryPointLoader + EntryPointContainer

TODO



### commitMutation → useMutation

TODO


### requestSubscription → useSubscription

TODO

<DocsRating />
