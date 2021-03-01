---
id: rendering-partially-cached-data
title: Rendering Partially Cached Data
slug: /guided-tour/reusing-cached-data/rendering-partially-cached-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbProfilePhotoHeaderExample from './fb/FbProfileHeaderExample.md';

## Rendering Partially Cached Data

Often times when dealing with cached data, we'd like the ability to perform partial rendering. We define *"partial rendering"* as the ability to immediately render a query that is partially cached. That is, parts of the query might be missing, but parts of the query might already be cached. In these cases, we want to be able to immediately render the parts of the query that are cached, without waiting on the full query to be fetched.

This can be useful in scenarios where we want to render a screen or a page as fast as possible, and we know that some of the data for that page is already cached so we can skip a loading state. For example, take the profile page: it is very likely that the user's name has already been cached at some point during usage of the app, so when visiting a profile page, if the name of the user is cached, we'd like to render immediately, even if the rest of the data for the profile page isn't available yet.


### Fragments as boundaries for partial rendering

To do this, we rely on the ability of fragment components to *suspend* (see the [Loading States with Suspense](../../rendering/loading-states/) section). *A fragment component will suspend* *if* *any of the data it declared locally is missing during render, and is currently being fetched.* Specifically, it will suspend until the data it requires is fetched, that is, until the query it belongs to (its *parent query*) is fetched.

Let's explain what this means with an example. Say we have the following fragment component:

```js
/**
 * UsernameComponent.react.js
 *
 * Fragment Component
 */

import type {UsernameComponent_user$key} from 'UsernameComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UsernameComponent_user$key,
};

function UsernameComponent(props: Props) {
  const user = useFragment(
    graphql`
      fragment UsernameComponent_user on User {
        username
      }
    `,
    props.user,
  );
  return (...);
}

module.exports = UsernameComponent;
```


And we have the following query component,  which queries for some data, and also includes the fragment above:

```js

/**
 * AppTabs.react.js
 *
 * Query Loader Component
 */

 // ....

  const onSelectHomeTab = () => {
    loadHomeTabQuery({id: '4'}, {fetchPolicy: 'store-or-network'});
  }

 // ...

/**
 * HomeTab.react.js
 *
 * Query Component
 */

const React = require('React');
const {graphql, usePreloadedQuery} = require('react-relay');

const UsernameComponent = require('./UsernameComponent.react');

function HomeTab(props: Props) {
  const data = usePreloadedQuery<AppQuery>(
    graphql`
      query HomeTabQuery($id: ID!) {
        user(id: $id) {
          name
          ...UsernameComponent_user
        }
      }
    `,
    props.queryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <UsernameComponent user={data.user} />
    </>
  );
}
```


Say that when this `HomeTab` component is rendered, we've already previously fetched *(_only_)* the `name` for the `User` with `{id: 4}`, and it is locally cached in the Relay Store.

If we attempt to render the query with a `fetchPolicy` that allows reusing locally cached data (`'store-or-network'`, or `'store-and-network'`), the following will occur:

* The query will check if any of its locally required data is missing. In this case, *it isn't*. ** Specifically, the query is only directly querying for the `name`, and the name *is* available, so as far as the query is concerned, none of the data it requires to render *itself* is missing. This is important to keep in mind: when rendering a query, we eagerly read out data and render the tree, instead of blocking rendering the entire tree until *all* of the data for the query  (i.e. including nested fragments) is fetched. As we render, *we will consider data to be missing for a component if the data it declared locally is missing, i.e. if any data required to render the current component is missing, and _not_ if data for descendant components is missing.*
* Given that the query doesn't have any data missing, it will render, and then attempt to render the child `UsernameComponent`.
* When the `UsernameComponent` attempts to render the `UsernameComponent_user` fragment, it will notice that some of the data required to render itself is missing; specifically, the `username` is missing. At this point, since `UsernameComponent` has missing data, it will suspend rendering until the network request completes. Note that regardless of which `fetchPolicy` you choose, a network request will always be started if any piece of data for the full query, i.e. including fragments, is missing.


At this point, when `UsernameComponent` suspends due to the missing `username`, ideally we should still be able to render the `User`'s `name` immediately, since it's locally cached. However, since we aren't using a `Suspense` component to catch the fragment's suspension, the suspension will bubble up and the entire `App` component will be suspended.

In order to achieve the desired effect of rendering the `name` when it's available even if the `username`  is missing, we just need to wrap the `UsernameComponent` in `Suspense,` to *allow* the other parts of `App` to continue rendering:

```js
/**
 * HomeTab.react.js
 *
 * Query Component
 */

const React = require('React');
const {Suspense} = require('React');
const {graphql, usePreloadedQuery} = require('react-relay');

const UsernameComponent = require('./UsernameComponent.react');


function HomeTab() {
  const data = usePreloadedQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
          ...UsernameComponent_user
        }
      }
    `,
    props.queryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>

      {/*
        Wrap the UserComponent in Suspense to allow other parts of the
        App to be rendered even if the username is missing.
      */}
      <Suspense fallback={<LoadingSpinner label="Fetching username" />}>
        <UsernameComponent user={data.user} />
      </Suspense>
    </>
  );
}

```

<FbInternalOnly>

> NOTE: In Comet, we use the `CometPlaceholder` component instead of using `Suspense` directly.

</FbInternalOnly>

* * *
The process that we described above works the same way for nested fragments (i.e. fragments that include other fragments). This means that if the data required to render a fragment is locally cached, the fragment component will be able to render, regardless of whether data for any of its child or descendant fragments is missing. If data for a child fragment is missing, we can wrap it in a `Suspense` component to allow other fragments and parts of the app to continue rendering.

As mentioned in our motivating example, this is desirable because it can allows us to skip loading states entirely. More specifically, the ability to render data that is partially available allows us to render intermediate UI states that more closely resemble the final rendered state.

<FbProfilePhotoHeaderExample />

<DocsRating />
