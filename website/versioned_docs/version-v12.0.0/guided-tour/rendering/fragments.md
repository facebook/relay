---
id: fragments
title: Fragments
slug: /guided-tour/rendering/fragments/
description: Relay guide to rendering fragments
keywords:
- useFragment
- rendering
- fragment
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

The main building block for declaring data dependencies for React Components in Relay are [GraphQL Fragments](https://graphql.org/learn/queries/#fragments). Fragments are reusable units in GraphQL that represent a set of data to query from a GraphQL type exposed in the [schema](https://graphql.org/learn/schema/).

In practice, they are a selection of fields on a GraphQL Type:

```graphql
fragment UserFragment on User {
  name
  age
  profile_picture(scale: 2) {
    uri
  }
}
```


In order to declare a fragment inside your JavaScript code, you must use the `graphql` tag:

```js
const {graphql} = require('react-relay');

const userFragment = graphql`
  fragment UserFragment_user on User {
    name
    age
    profile_picture(scale: 2) {
      uri
    }
  }
`;
```

## Rendering Fragments

In order to *render* the data for a fragment, you can use the `useFragment` Hook:

```js
import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');

const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UserComponent_user$key,
};

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

module.exports = UserComponent;
```

Let's distill what's going on here:

* `useFragment` takes a fragment definition and a *fragment reference*, and returns the corresponding `data` for that fragment and reference.
* A *fragment reference* is an object that Relay uses to *read* the data declared in the fragment definition; as you can see, the `UserComponent_user` fragment itself just declares fields on the `User` type, but we need to know *which* specific user to read those fields from; this is what the fragment reference corresponds to. In other words, a fragment reference is like *a pointer to a specific instance of a type* that we want to read data from.
* Note that *the component is automatically subscribed to updates to the fragment data*: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* Relay will automatically generate Flow types for any declared fragments when the compiler is run, so you can use these types to declare the type for your Component's `props`.
    * The generated Flow types include a type for the fragment reference, which is the type with the `$key` suffix: `<fragment_name>$key`, and a type for the shape of the data, which is the type with the `$data` suffix:  `<fragment_name>$data`; these types are available to import from files that are generated with the following name: `<fragment_name>.graphql.js`.
    * We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared when using `useFragment`. By using a properly typed fragment reference as input, the type of the returned `data` will automatically be Flow typed without requiring an explicit annotation.
    * In our example, we're typing the `user` prop as the fragment reference we need for `useFragment`, which corresponds to the `UserComponent_user$key` imported from  `UserComponent_user.graphql`, which means that the type of `data` above would be: `{ name: ?string, profile_picture: ?{ uri: ?string } }`.
* Fragment names need to be globally unique. In order to easily achieve this, we name fragments using the following convention based on the module name followed by an identifier: `<module_name>_<property_name>`. This makes it easy to identify which fragments are defined in which modules and avoids name collisions when multiple fragments are defined in the same module.


If you need to render data from multiple fragments inside the same component, you can use  `useFragment` multiple times:

```js
import type {UserComponent_user$key} from 'UserComponent_user.graphql';
import type {UserComponent_viewer$key} from 'UserComponent_viewer.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UserComponent_user$key,
  viewer: UserComponent_viewer$key,
};

function UserComponent(props: Props) {
  const userData = useFragment(
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

  const viewerData = useFragment(
    graphql`
      fragment UserComponent_viewer on Viewer {
        actor {
          name
        }
      }
    `,
    props.viewer,
  );

  return (
    <>
      <h1>{userData.name}</h1>
      <div>
        <img src={userData.profile_picture?.uri} />
        Acting as: {viewerData.actor?.name ?? 'Unknown'}
      </div>
    </>
  );
}

module.exports = UserComponent;
```

## Composing Fragments

In GraphQL, fragments are reusable units, which means they can include *other* fragments, and consequently a fragment can be included within other fragments or [queries](../queries/):

```graphql
fragment UserFragment on User {
  name
  age
  profile_picture(scale: 2) {
    uri
  }
  ...AnotherUserFragment
}

fragment AnotherUserFragment on User {
  username
  ...FooUserFragment
}
```


With Relay, you can compose fragment components in a similar way, using both component composition and fragment composition. Each React component is responsible for fetching the data dependencies of its direct children - just as it has to know about its children's props in order to render them correctly. This pattern means that developers are able to reason locally about components - what data they need, what components they render - but Relay is able to derive a global view of the data dependencies of an entire UI tree.

```js
/**
 * UsernameSection.react.js
 *
 * Child Fragment Component
 */

import type {UsernameSection_user$key} from 'UsernameSection_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UsernameSection_user$key,
};

function UsernameSection(props: Props) {
  const data = useFragment(
    graphql`
      fragment UsernameSection_user on User {
        username
      }
    `,
    props.user,
  );

  return <div>{data.username ?? 'Unknown'}</div>;
}

module.exports = UsernameSection;
```

```js
/**
 * UserComponent.react.js
 *
 * Parent Fragment Component
 */

import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

const UsernameSection = require('./UsernameSection.react');

type Props = {
  user: UserComponent_user$key,
};

function UserComponent(props: Props) {
  const user = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name
        age
        profile_picture(scale: 2) {
          uri
        }

        # Include child fragment:
        ...UsernameSection_user
      }
    `,
    props.user,
  );

  return (
    <>
      <h1>{user.name}</h1>
      <div>
        <img src={user.profile_picture?.uri} />
        {user.age}

        {/* Render child component, passing the _fragment reference_: */}
        <UsernameSection user={user} />
      </div>
    </>
  );
}

module.exports = UserComponent;
```

There are a few things to note here:

* `UserComponent` both renders `UsernameSection`, *and* includes the fragment declared by `UsernameSection` inside its own `graphql` fragment declaration.
* `UsernameSection` expects a *fragment reference* as the `user` prop. As we've mentioned before, a fragment reference is an object that Relay uses to *read* the data declared in the fragment definition; as you can see, the child `UsernameSection_user` fragment itself just declares fields on the `User` type, but we need to know *which* specific user to read those fields from; this is what the fragment reference corresponds to. In other words, a fragment reference is like *a pointer to a specific instance of a type* that we want to read data from.
*  Note that in this case the `user` passed to `UsernameSection`, i.e. the fragment reference, *doesn't actually contain any of the data declared by the child `UsernameSection` component*; instead, `UsernameSection` will use the fragment reference to read the data *it* declared internally, using `useFragment`. This prevents the parent from implicitly creating dependencies on data declared by its children, and vice-versa, which allows us to reason locally about our components and modify them without worrying about affecting other components. If this wasn't the case, and the parent had access to the child's data, modifying the data declared by the child could break the parent. This is known as [*data masking*](../../../principles-and-architecture/thinking-in-relay/).
* The *fragment reference* that the child (i.e.  `UsernameSection`) expects is the result of reading a parent fragment that *includes* the child fragment. In our particular example, that means the result of reading a fragment that includes `...UsernameSection_user` will be the fragment reference that `UsernameSection` expects. In other words, the data obtained as a result of reading a fragment via `useFragment` also serves as the fragment reference for any child fragments included in that fragment.


## Composing Fragments into Queries

Fragments in Relay allow declaring data dependencies for a component, but they ***can't be fetched by themselves***. Instead, they need to be included in a query, either directly or transitively. This means that *all fragments must belong to a query when they are rendered*, or in other words, they must be "rooted" under some query. Note that a single fragment can still be included by multiple queries, but when rendering a specific *instance* of a fragment component, it must have been included as part of a specific query request.

To fetch and render a query that includes a fragment, you can compose them in the same way fragments are composed, as shown in the [Composing Fragments](#composing-fragments) section:

```js
/**
 * UserComponent.react.js
 *
 * Fragment Component
 */

import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UserComponent_user$key,
};

function UserComponent(props: Props) {
  const data = useFragment(
    graphql`...`,
    props.user,
  );

  return (...);
}

module.exports = UserComponent;
```

```js
/**
 * App.react.js
 *
 * Query Component
 */

import type {AppQuery} from 'AppQuery.graphql';
import type {PreloadedQuery} from 'react-relay';

const React = require('React');
const {graphql, usePreloadedQuery} = require('react-relay');

const UserComponent = require('./UserComponent.react');

type Props = {
  appQueryRef: PreloadedQuery<AppQuery>,
}

function App({appQueryRef}) {
  const data = usePreloadedQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name

          # Include child fragment:
          ...UserComponent_user
        }
      }
    `,
    appQueryRef,
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      {/* Render child component, passing the fragment reference: */}
      <UserComponent user={data.user} />
    </>
  );
}
```

Note that:

* The *fragment reference* that  `UserComponent` expects is is the result of reading a parent query that includes its fragment, which in our case means a query that includes `...UsernameSection_user`. In other words, the `data` obtained as a result of `usePreloadedQuery` also serves as the fragment reference for any child fragments included in that query.
* As mentioned previously, *all fragments must belong to a query when they are rendered,* which means that all fragment components *must* be descendants of a query. This guarantees that you will always be able to provide a fragment reference for `useFragment`, by starting from the result of reading a root query with `usePreloadedQuery`.

<DocsRating />
