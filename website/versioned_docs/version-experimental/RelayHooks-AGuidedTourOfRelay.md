---
id: a-guided-tour-of-relay
title: A Guided Tour
original_id: a-guided-tour-of-relay
---

[Relay](https://relay.dev/) is a framework for managing and declaratively fetching GraphQL data. Specifically, it provides a set of APIs to fetch and declare data dependencies for React components, in colocation with component definitions themselves.

In this guide, we're going to go over how to use Relay to build out some of the more common use cases in apps. If you're interested in a detailed reference of our APIs, check out our [API Reference](./api-reference) page. Before getting started, bear in mind that we assume some level of familiarity with JavaScript, [React](https://reactjs.org/docs/getting-started.html), [GraphQL](https://graphql.org/learn/), and assume that you have set up a GraphQL Server that adheres to the [Relay specification](./graphql-server-specification)

## Example App

To see a full example using Relay Hooks and our integration with [Suspense for Data Fetching](https://reactjs.org/docs/concurrent-mode-suspense.html), check out: [relay-examples/issue-tracker](https://github.com/relayjs/relay-examples/tree/main/issue-tracker).

## Setup and Workflow

In case you've never worked with Relay before, here's a rundown of what you need to set up to get up and running developing with Relay:

### Installation

Install the experimental versions of React and Relay using `yarn` or `npm`:

```sh

yarn add react@experimental react-dom@experimental react-relay@experimental

```

### Babel plugin

Relay requires a Babel plugin to process `graphql` tags inside your JavaScript code:

```sh

yarn add --dev babel-plugin-relay graphql

```

Add `"relay"` to the list of plugins in your `.babelrc` file:

```javascript
{
  "plugins": [
    "relay"
  ]
}
```

Please note that the `"relay"` plugin should run before other plugins or
presets to ensure the `graphql` template literals are correctly transformed. See
Babel's [documentation on this topic](https://babeljs.io/docs/plugins/#pluginpreset-ordering).

Alternatively, instead of using `babel-plugin-relay`, you can use Relay with [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros). After installing `babel-plugin-macros` and adding it to your Babel config:

```javascript
const graphql = require('babel-plugin-relay/macro');
```

If you need to configure `babel-plugin-relay` further, you can do so by [specifying the options in a number of ways](https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md#config-experimental).

### Relay Compiler

Whenever you're developing Relay components, for example by writing [Fragments](#fragments) or [Queries](#queries), you will need to run the [Relay Compiler](./graphql-in-relay#relay-compiler). The Relay Compiler will read and analyze any `graphql` inside your JavaScript code, and produce a set of artifacts that will be used by Relay at runtime (i.e. when the application is running on the browser).

To install the compiler, you can use `yarn` or `npm`:

```sh

yarn add --dev relay-compiler

```

This installs the bin script `relay-compiler` in your `node_modules` folder. It's recommended to run this from a `yarn`/`npm` script by adding a script to your `package.json` file:

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql"
}
```

or if you are using jsx:

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --extensions js jsx"
}
```

Then, whenever you've made edits to your application files, you can run the `relay` script to run the compiler and generate new compiled artifacts:

```sh

# Single run
yarn run relay

```

You can also pass the `--watch` option to watch for changes in your application files and automatically re-compile the artifacts (**Note:** Requires [watchman](https://facebook.github.io/watchman) to be installed):

```sh

# Watch for changes
yarn run relay --watch

```

### Config file

The configuration of `babel-plugin-relay` and `relay-compiler` can be applied using a single configuration file by
using the `relay-config` package. Besides unifying all Relay configuration in a single place, other tooling can leverage this to provide zero-config setup (e.g. [vscode-apollo-relay](https://github.com/relay-tools/vscode-apollo-relay)).

Install the package:

```sh

yarn add --dev relay-config

```

And create the configuration file:

```javascript
// relay.config.js
module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: "./src",
  schema: "./data/schema.graphql",
  exclude: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
}
```

## Rendering Data Basics

### Fragments

The main building block for declaring data dependencies for React Components in Relay are [GraphQL fragments](https://graphql.org/learn/queries/#fragments), which are essentially a selection of fields on a GraphQL Type:

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

```javascript
const {graphql} = require('react-relay/hooks');

const userFragment = graphql`
  fragment UserFragment on User {
    name
    age
    profile_picture(scale: 2) {
      uri
    }
  }
`;
```

In order to _render_ the data for a fragment, you can use the **`useFragment`** Hook:

```javascript
import type {UserComponent_user$key} from 'UserComponent_user.graphql';

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

module.exports = UserComponent;
```

Let's distill what's going on here:

-   `useFragment` takes a fragment definition and a **_fragment reference_**, and returns the corresponding `data` for that fragment and reference.
-   A **_fragment reference_** is an object that Relay uses to **_read_** the data declared in the fragment definition; as you can see, the `UserComponent_user` fragment itself just declares fields on the `User` type, but we need to know **_which_** specific user to read those fields from; this is what the fragment reference corresponds to. In other words, a fragment reference is like **_a pointer to a specific instance of a type_** that we want to read data from.
-   Note that **_the component is automatically subscribed to updates to the fragment data:_** if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
-   Relay will automatically generate Flow types for any declared fragments when the compiler is run, so you can use these types to declare the type for your Component's `props`.
    -   The generated Flow types include a type for the fragment reference, which is the type with the **`$key`** suffix: `<fragment_name>$key`, and a type for the shape of the data, which is the type with the **`$data`** suffix:  `<fragment_name>$data`; these types are available to import from files that are generated with the following name: `<fragment_name>.graphql.js`.
    -   We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared when using `useFragment`. By using a properly typed fragment reference as input, the type of the returned `data` will automatically be Flow typed without requiring an explicit annotation.
    -   In our example, we're typing the `user` prop as the fragment reference we need for `useFragment`, which corresponds to the `UserComponent_user$key` imported from  `UserComponent_user.graphql`, which means that the type of `data` above would be: `{| name: ?string, profile_picture: ?{| uri: ?string |} |}`.
-   Fragment names need to be globally unique. In order to easily achieve this, we name fragments using the following convention based on the module name followed by an identifier: `<module_name>_<property_name>`. This makes it easy to identify which fragments are defined in which modules and avoids name collisions when multiple fragments are defined in the same module.

If you need to render data from multiple fragments inside the same component, you can use  **`useFragment`** multiple times:

```javascript
import type {UserComponent_user$key} from 'UserComponent_user.graphql';
import type {UserComponent_viewer$key} from 'UserComponent_viewer.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay/hooks');

type Props = {|
  user: UserComponent_user$key,
  viewer: UserComponent_viewer$key,
|};

function UserComponent(props: Props) {
  const userData = useFragment(
    graphql`
      fragment UserComponent_user on User(id: $ID!) {
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

### Composing Fragments

In GraphQL, fragments are reusable units, which means they can include _other_ fragments, and consequently a fragment can be included within other fragments or [Queries](#queries):

```

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

```javascript
/**
 * UsernameSection.react.js
 *
 * Child Fragment Component
 */

import type {UsernameSection_user$key} from 'UsernameSection_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay/hooks');

type Props = {|
  user: UsernameSection_user$key,
|};

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

```javascript
/**
 * UserComponent.react.js
 *
 * Parent Fragment Component
 */

import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay/hooks');

const UsernameSection = require('./UsernameSection.react');

type Props = {|
  user: UserComponent_user$key,
|};

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

  // Render child component by passing the _fragment reference_ to <UsernameSection>
  return (
    <>
      <h1>{user.name}</h1>
      <div>
        <img src={user.profile_picture?.uri} />
        {user.age}

        <UsernameSection user={user}/>
      </div>
    </>
  );
}

module.exports = UserComponent;
```

There are a few things to note here:

-   `UserComponent` both renders `UsernameSection`, _and_ includes the fragment declared by `UsernameSection` inside its own `graphql` fragment declaration.
-   `UsernameSection` expects a **_fragment reference_** as the `user` prop. As we've mentioned before, a fragment reference is an object that Relay uses to **_read_** the data declared in the fragment definition; as you can see, the child `UsernameSection_user` fragment itself just declares fields on the `User` type, but we need to know **_which_** specific user to read those fields from; this is what the fragment reference corresponds to. In other words, a fragment reference is like **_a pointer to a specific instance of a type_** that we want to read data from.
-   Note that in this case the `user` passed to `UsernameSection`, i.e. the fragment reference, _doesn't actually contain any of the data declared by the child `UsernameSection` component_; instead, `UsernameSection` will use the fragment reference to read the data _it_ declared internally, using `useFragment`. This prevents the parent from implicitly creating dependencies on data declared by its children, and vice-versa, which allows us to reason locally about our components and modify them without worrying about affecting other components. If this wasn't the case, and the parent had access to the child's data, modifying the data declared by the child could break the parent. This is known as [**_data masking_**](https://relay.dev/docs/en/thinking-in-relay#data-masking).
-   The **_fragment reference_** that the child (i.e.  `UsernameSection`) expects is the result of reading a parent fragment that _includes_ the child fragment. In our particular example, that means the result of reading a fragment that includes `...UsernameSection_user` will be the fragment reference that `UsernameSection` expects. In other words, the data obtained as a result of reading a fragment via `useFragment` also serves as the fragment reference for any child fragments included in that fragment.

### Queries

A [GraphQL query](https://graphql.org/learn/queries/) is a request that can be sent to a GraphQL server in combination with a set of [Variables](#variables), in order to fetch some data. It consists of a selection of fields, and potentially includes other fragments:

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

Sample response:

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

**_NOTE:_** Fragments in Relay allow declaring data dependencies for a component, but they can't be fetched by themselves; they need to be included by a query, either directly or transitively. This implies that **_all fragments must belong to a query when they are rendered_**, or in other words, they must be _rooted_ under some query. Note that a single fragment can still be included by multiple queries, but when rendering a specific _instance_ of a fragment component, it must have been included as part of a specific query request.

* * *

To **_fetch_** _and_ render a query in Relay, you can use **`useLazyLoadQuery`** Hook:

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
    {id: '4'},
  );

  return (
    <h1>{data.user?.name}</h1>
  );
}
```

Lets see what's going on here:

-   **`useLazyLoadQuery`**  takes a `graphql` query and some variables for that query, and returns the data that was fetched for that query. The `variables` are an object containing the values for the [Variables](#variables) referenced inside the GraphQL query.
-   Similarly to fragments, the component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
-   `useLazyLoadQuery` additionally, it takes a Flow type parameter, which corresponds to the Flow type for the query, in this case `AppQuery`.
    -   Remember that Relay automatically generates Flow types for any declared queries, which you can import and use with `useLazyLoadQuery`. These types are available in the generated files with the following name format: `<query_name>.graphql.js`.
    -   Note that the `variables` will checked by Flow to ensure that you are passing values that match what the GraphQL query expects.
    -   Note that the `data` is already properly Flow typed without requiring an explicit annotation, and is based on the types from the GraphQL schema. For example, the type of `data` above would be: `{| user: ?{| name: ?string |} |}`.
-   By default, when the component renders, Relay will automatically **_fetch_** the data for this query from the server (if it isn't already cached), and return it as a the result of the `useLazyLoadQuery` call. We'll go into more detail about how to show loading states in the [Loading States With Suspense](#loading-states-with-suspense) section, and how Relay uses cached data in the [Reusing Cached Data for Render](#reusing-cached-data-for-render) section.
-   Note that if you re-render your component and pass **_different query variables_** than the ones originally used, it will cause the query to be fetched again with the new variables, and potentially re-render with different data.
-   Finally, make sure you're providing a Relay environment at the root of your app before trying to render a query: [Relay Environment Provider](#relay-environment-provider).

To fetch and render a query that includes a fragment, you can compose them in the same way fragments are composed, as shown in the [Composing Fragments](#composing-fragments) section:

```javascript
/**
 * UserComponent.react.js
 *
 * Fragment Component
 */

import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay/hooks');

type Props = {|
  user: UserComponent_user$key,
|};

function UserComponent(props: Props) {
  const data = useFragment(
    graphql`...`,
    props.user,
  );

  return (...);
}

module.exports = UserComponent;
```

```javascript
/**
 * App.react.js
 *
 * Query Component
 */

import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

const UserComponent = require('./UserComponent.react');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name

          # Include child fragment:
          ...UserComponent_user
        }
      }
    `,
    {id: '4'},
  );

  // Render child component by passing the fragment reference to <UserComponent>:
  return (
    <>
      <h1>{data.user?.name}</h1>
      <UserComponent user={data.user} />
    </>
  );
}
```

Note that:

-   The **_fragment reference_** that `UserComponent` expects is the result of reading a parent query that includes its fragment, which in our case means a query that includes `...UsernameSection_user`. In other words, the `data` obtained as a result of `useLazyLoadQuery` also serves as the fragment reference for any child fragments included in that query.
-   As mentioned previously, **_all fragments must belong to a query when they are rendered,_** which means that all fragment components _must_ be descendants of a query. This guarantees that you will always be able to provide a fragment reference for `useFragment`, by starting from the result of reading a root query with `useLazyLoadQuery`.

### Variables

You may have noticed that the query declarations in our examples above contain references to an `$id` symbol inside the GraphQL code: these are [GraphQL Variables](https://graphql.org/learn/queries/#variables).

GraphQL variables are a construct that allows referencing dynamic values inside a GraphQL query. When fetching a query from the server, we also need to provide as input the actual set of values to use for the variables declared inside the query:

```graphql
# `$id` is a variable of type `ID!`
query UserQuery($id: ID!) {

  # The value of `$id` is used as input to the user() call:
  user(id: $id) {
    id
    name
  }
}
```

When sending a network request to fetch the query above, we need to provide both the query, and the variables to be used for this particular execution of the query. For example:

```graphql
# Query:
query UserQuery($id: ID!) {
  # ...
}

# Variables:
{"id": 4}
```

Fetching the above query and variables from the server would produce the following response:

```javascript
{
  "data": {
    "user": {
      "id": "4",
      "name": "User 4"
    }
  }
}
```

-   Note that changing the value of the `id` variable used as input would of course produce a different response.

* * *

Fragments can also reference variables that have been declared by a query:

```graphql
fragment UserFragment on User {
  name
  profile_picture(scale: $scale) {
    uri
  }
}

query ViewerQuery($scale: Float!) {
  viewer {
    actor {
      ...UserFragment
    }
  }
}
```

-   Even though the fragment above doesn't _declare_ the `$scale` variable directly, it can still reference it. Doing so makes it so any query that includes this fragment, either directly or transitively, **_must_** declare the variable and it's type, otherwise an error will be produced by the Relay compiler.
-   In other words, **_query variables are available globally by any fragment that is a descendant of the query_**.

In Relay, fragment declarations inside components can also reference query variables:

```javascript
function UserComponent(props: Props) {
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

  return (...);
}
```

-   The above fragment could be included by multiple queries, and rendered by different components, which means that any query that ends up rendering/including the above fragment **_must_** declare the `$scale` variable.
-   If any query that happens to include this fragment _doesn't_ declare the `$scale` variable, an error will be produced by the Relay Compiler at build time, ensuring that an incorrect query never gets sent to the server (sending a query with missing variable declarations will also produce an error in the server).

### `@arguments` and `@argumentDefinitions`

However, in order to prevent bloating queries with global variable declarations, Relay also provides a way to declare variables that are scoped locally to a fragment using the **`@arguments`** and **`@argumentDefinitions`** directives:

```javascript
/**
 * Declare a fragment that accepts arguments with @argumentDefinitions
 */

function PictureComponent(props) {
  const data = useFragment(
    graphql`
      fragment PictureComponent_user on User
        @argumentDefinitions(scale: {type: "Float!"}) {

        # `$scale` is a local variable here, declared above
        # as an argument `scale`, of type `Float!`
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    props.user,
  );
}
```

```javascript
/**
 * Include fragment using @arguments
 */

function UserComponent(props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name

        # Pass value of 2.0 for the `scale` variable
        ...PictureComponent_user @arguments(scale: 2.0)
      }
    `,
    props.user,
  );
}
```

```javascript
/**
 * Include same fragment using _different_ @arguments
 */

function OtherUserComponent(props) {
  const data = useFragment(
    graphql`
      fragment OtherUserComponent_user on User {
        name

        # Pass a different value for the scale variable.
        # The value can be another local or global variable:
        ...PictureComponent_user @arguments(scale: $pictureScale)
      }
    `,
    props.user,
  );
}
```

-   Note that when passing `@arguments` to a fragment, we can pass a literal value or pass another variable. The variable can be a global query variable, or another local variable declared via `@argumentDefinitions`.
-   When we actually fetch `PictureComponent_user` as part of a query, the `scale` value passed to the `profile_picture` field will depend on the argument that was provided by the parent of `PictureComponent_user`:
    -   For `UserComponent_user` the value of `$scale` will be 2.0.
    -   For `OtherUserComponent_user`, the value of `$scale` will be whatever value we pass to the server for the `$pictureScale` variable when we fetch the query.

Fragments that expect arguments can also declare default values, making the arguments optional:

```javascript
/**
 * Declare a fragment that accepts arguments with default values
 */

function PictureComponent(props) {
  const data = useFragment(
    graphql`
      fragment PictureComponent_user on User
        @argumentDefinitions(scale: {type: "Float!", defaultValue: 2.0}) {

        # `$scale` is a local variable here, declared above
        # as an argument `scale`, of type `Float!` with a default value of `2.0`
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    props.user,
  );
}
```

```javascript
function UserComponent(props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name

        # Do not pass an argument, value for scale will be `2.0`
        ...PictureComponent_user
      }
    `,
    props.user,
  );
}
```

-   Not passing the argument to `PictureComponent_user` makes it use the default value for its locally declared `$scale` variable, in this case 2.0.

#### Accessing GraphQL Variables At Runtime

If you want to access the variables that were set at the query root, the recommended approach is to pass the variables down the component tree in your application, using props, or your own application-specific context.

Relay currently does not expose the resolved variables (i.e. after applying argument definitions) for a specific fragment, and you should very rarely need to do so.

### Loading States with Suspense

As you may have noticed, we mentioned that using `useLazyLoadQuery` will **_fetch_** a query from the server, but we didn't elaborate on how to render a loading UI while the query is being loaded. We will cover that in this section.

To render loading states while a query is being fetched, we rely on [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html). Suspense is a new feature in React that allows components to interrupt or _"suspend"_ rendering in order to wait for some asynchronous resource (such as code, images or data) to be loaded; when a component "suspends", it indicates to React that the component isn't _"ready"_ to be rendered yet, and won't be until the asynchronous resource it's waiting for is loaded. When the resource finally loads, React will try to render the component again.

This capability is useful for components to express asynchronous dependencies like data, code, or images that they require in order to render, and lets React coordinate rendering the loading states across a component tree as these asynchronous resources become available. More generally, the use of Suspense give us better control to implement more deliberately designed loading states when our app is loading for the first time or when it's transitioning to different states, and helps prevent accidental flickering of loading elements (such as spinners), which can commonly occur when loading sequences aren't explicitly designed and coordinated.

For a lot more details on Suspense, check the [React docs on Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html).

#### Loading fallbacks with Suspense Boundaries

When a component is suspended, we need to render a _fallback_ in place of the component while we await for it to become _"ready"_. In order to do so, we use the `Suspense` component provided by React:

```javascript
const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // Render a fallback using Suspense as a wrapper
    <Suspense fallback={<LoadingSpinner />}>
      <CanSuspend />
    </Suspense>
  );
}
```

`Suspense` components can be used to wrap any component; if the target component suspends, `Suspense` will render the provided fallback until all its descendants become _"ready"_ (i.e. until _all_ of the promises thrown inside its subtree of descendants resolve). Usually, the fallback is used to render a loading state, such as a glimmer.

Usually, different pieces of content in our app might suspend, so we can show loading state until they are resolved by using `Suspense` :

```javascript
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');

function App() {
  return (
    // LoadingSpinner is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent
        // MainContent may suspend
      />
    </Suspense>
  );
}
```

Let's distill what's going on here:

-   If `MainContent` suspends because it's waiting on some asynchronous resource (like data), the `Suspense` component that wraps `MainContent` will detect that it suspended, and will render the **`fallback`** element (i.e. the `LoadingSpinner` in this case) up until `MainContent` is ready to be rendered. Note that this also transitively includes descendants of `MainContent`, which might also suspend.

What's nice about Suspense is that you have granular control about how to accumulate loading states for different parts of your component tree:

```javascript
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');
const SecondaryContent = require('./SecondaryContent.react');

function App() {
  return (
    // A LoadingSpinner for *_all_* content is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent />
      <SecondaryContent
        // SecondaryContent can also suspend
      />
    </Suspense>
  );
}
```

-   In this case, both `MainContent` and `SecondaryContent` may suspend while they load their asynchronous resources; by wrapping both in a `Suspense`, we can show a single loading state up until they are **_all_** ready, and then render the entire content in a single paint, after everything has successfully loaded.
-   In fact, `MainContent` and `SecondaryContent` may suspend for different reasons other than fetching data, but the same `Suspense` component can be used to render a fallback up until **_all_** components in the subtree are ready to be rendered. Note that this also transitively includes descendants of `MainContent` or `SecondaryContent`, which might also suspend.

Conversely, you can also decide to be more granular about your loading UI and wrap Suspense components around smaller or individual parts of your component tree:

```javascript
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const LeftColumn = require('./LeftHandColumn.react');
const LeftColumnPlaceholder = require('./LeftHandColumnPlaceholder.react');
const MainContent = require('./MainContent.react');
const SecondaryContent = require('./SecondaryContent.react');

function App() {
  return (
    <>
      <Suspense
        // Show a separate loading UI for the LeftHandColumn
        fallback={<LeftColumnPlaceholder />}
      >
        <LeftColumn />
      </Suspense>

      <Suspense
        // Show a separate loading UI for both the Main and Secondary content
        fallback={<LoadingSpinner />}
      >
        <MainContent />
        <SecondaryContent />
      </Suspense>
    </>
  );
}
```

-   In this case, we're showing 2 separate loading UIs:
    -   One to be shown until the `LeftColumn` becomes ready.
    -   And one to be shown until both the `MainContent` and `SecondaryContent` become ready.
-   What is powerful about this is that by more granularly wrapping our components in Suspense, **_we allow other components to be rendered earlier as they become ready_**. In our example, by separately wrapping `MainContent` and `SecondaryContent` under `Suspense`, we're allowing `LeftColumn` to render as soon as it becomes ready, which might be earlier than when the content sections become ready.

#### Transitions and Updates that Suspend

`Suspense` boundary fallbacks allow us to describe our loading states when initially rendering some content, but our applications will also have transitions between different content. Specifically, when switching between two components within an already mounted boundary, the new component you're switching to might not have loaded all of its async dependencies, which means that it will also suspend.

Whenever we're going to make a transition that might cause new content to suspend, we should use the [**`useTransition`**](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) to schedule the update for  transition:

```javascript
const {
  useState,
  useTransition,
} = require('React');

function TabSwitcher() {
  // We use startTransition to schedule the update
  const [startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState('Home');

  return (
    <div>
      <Suspense fallback={<LoadingGlimmer />}>
        <MainContent tab={selectedTab} />
      </Suspense>
      <Button
        onClick={() =>
          startTransition(() => {
            // Schedule an update that might suspend
            setSelectedTab('Photos');
          })
        }>
        Show Photos
      </Button>
    </div>
  );
}
```

Let's take a look at what's happening here:

-   We have a `MainContent` component that takes a tab to render. This component might suspend while it loads the content for the current tab. During initial render, if this component suspends, we'll show the `LoadingGlimmer` fallback from the `Suspense` boundary that is wrapping it.
-   Additionally, in order to change tabs, we're keeping some state for the currently selected tab; when we set state to change the current tab, this will be an update that can cause the `MainContent` component to suspend again, since it may have to load the content for the new tab. Since this update may cause the component to suspend, **we need to make sure to schedule it using the `startTransition` function we get from `useTransition`**. By doing so, we're letting React know that the update may suspend, so React can coordinate and render it at the right priority.

However, when we make these sorts of transitions, we ideally want to avoid "bad loading states", that is, loading states (e.g. a glimmer) that would replace content that has already been rendered on the screen. In this case for example, if we're already showing content for a tab, instead of immediately replacing the content with a glimmer, we might instead want to render some sort of "pending" or "busy" state to let the user know that we're changing tabs, and then render the new selected tab when it's hopefully mostly ready. In order to do so, this is where we need to take into account the different [stages](https://reactjs.org/docs/concurrent-mode-patterns.html#the-three-steps) of a transition (**_pending_** → **_loading_** → **_complete_**), and make use of additional Suspense [primitives](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions), that allow us to control what we want to show at each stage.

The **_pending_** stage is the first state in a transition, and is usually rendered close to the element that initiated the action (e.g. a "busy spinner" next to a button); it should occur immediately (at a high priority), and be rendered quickly in order to give post to the user that their action has been registered. The **_loading_** state occurs when we actually start showing the new content or the next screen; this update is usually heavier it can take a little longer, so it doesn't need to be executed at the highest priority. _During the **loading** state is where we'll show the fallbacks from our `Suspense` boundaries_ (i.e. placeholders for the new content, like glimmers);  some of the content might be partially rendered during this stage as async resources are loaded, so it can occur in multiple steps, until we finally reach the **_complete_** state, where the full content is rendered.

By default, when a suspense transition occurs, if the new content suspends, React will automatically transition to the loading state and show the fallbacks from any `Suspense` boundaries that are in place for the new content.  However, if we want to delay showing the loading state, and show a _pending_ state instead, we can also use [**`useTransition`**](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) to do so:

```javascript
const {
  useState,
  useTransition,
} = require('React');

const SUSPENSE_CONFIG = {
  // timeoutMs allows us to delay showing the "loading" state for a while
  // in favor of showing a "pending" state that we control locally
  timeoutMs: 10 * 1000, // 10 seconds
};

function TabSwitcher() {
  // isPending captures the "pending" state. It will become true
  // **immediately** when the transition starts, and will be set back to false
  // when the transition reaches the fully "completed" stage (i.e. when all the
  // new content has fully loaded)
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG);
  const [selectedTab, setSelectedTab] = useState('Home');

  return (
    <div>
      <Suspense fallback={<LoadingGlimmer />}>
        <MainContent tab={selectedTab} />
      </Suspense>
      <Button
        onClick={() =>
          startTransition(() => {
            // Schedule an update that might suspend
            setSelectedTab('Photos');
          })
        }
        disabled={isPending}>
        Show Photos
      </Button>
    </div>
  );
}
```

<blockquote>
<strong>NOTE:</strong> Providing a Suspense config to <code>useTransition</code> will only work as expected in <strong><em>React Concurrent Mode</em></strong>.
</blockquote>

Let's take a look at what's happening here:

-   In this case, we're passing the **`SUSPENSE_CONFIG`** config object to `useTransition` in order to configure how we want this transition to behave. Specifically, we can pass a **`timeoutMs`** property in the config, which will dictate how long React should wait before transitioning to the _"loading"_ state (i.e. transition to showing the fallbacks from the `Suspense` boundaries), in favor of showing a **_pending_** state controlled locally by the component during that time.
-   `useTransition` will also return a **`isPending`** boolean value, which captures the pending state. That is, this value will become `true` **_immediately_** when the transition starts, and will become `false` when the transition reaches the fully _"completed"_ stage, that is, when all the new content has been fully loaded. As mentioned above, the pending state should be used to give immediate post to the user that the action has been received, and we can do so by using the `isPending` value to control what we render; for example, we can use that value to render a spinner next to the button, or in this case, disable the button immediately after it is clicked.

For more details, check out the [React docs on Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html).

#### How We Use Suspense in Relay

_**Queries**_

In our case, our query renderer components are components that can suspend, so we use Suspense to render loading states while a query is being fetched. Let's see what that looks like in practice:

Say we have the following query renderer component:

```javascript
/**
 * MainContent.react.js
 *
 * Query Component
 */

const React = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

function MainContent() {
  // **Fetch** and render a query
  const data = useLazyLoadQuery<...>(
    graphql`...`,
    variables: {...},
  );

  return (...);
}
```

```javascript
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');

function App() {
  return (
    // LoadingSpinner is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent
        // MainContent may suspend
      />
    </Suspense>
  );
}
```

Let's distill what's going on here:

-   We have a `MainContent` component, which is a query renderer that fetches and renders a query. `MainContent` will _suspend_ rendering when it attempts to fetch the query, indicating that it isn't ready to be rendered yet, and it will resolve when the query is fetched.
-   The `Suspense `component that wraps `MainContent` will detect that `MainContent` suspended, and will render the **`fallback`** element (i.e. the `LoadingSpinner` in this case) up until `MainContent` is ready to be rendered; that is, up until the query is fetched.

_**Fragments**_

Fragments are also integrated with Suspense in order to support rendering of data that's partially available in the Relay Store. For more details, check out the [Rendering Partially Cached Data](#rendering-partially-cached-data-highly-experimental) section.

**_Transitions_**

Additionally, our APIs for refetching ([Re-rendering with Different Data](#re-rendering-with-different-data)) and for [Rendering Connections](#rendering-connections) are also integrated with Suspense; for these use cases, we are initiating Suspense transitions after initial content has been rendered, such as by refetching or paginating, which means that these transitions should also use `useTransition`. Check out those sections for more details.

### Error States with Error Boundaries

As you may have noticed, we mentioned that using `useLazyLoadQuery` will **_fetch_** a query from the server, but we didn't elaborate on how to render UI to show an error if an error occurred during fetch. We will cover that in this section.

We can use [**Error Boundary**](https://reactjs.org/docs/error-boundaries.html) components to catch errors that occur during render (due to a network error, or any kind of error), and render an alternative error UI when that occurs. The way it works is similar to how `Suspense` works, by wrapping a component tree in an error boundary, we can specify how we want to react when an error occurs, for example by rendering a fallback UI.

[Error boundaries](https://reactjs.org/docs/error-boundaries.html) are simply components that implement the static **`getDerivedStateFromError`** method:

```javascript
const React = require('React');

type State = {|error: ?Error|};

class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error): State {
    // Set some state derived from the caught error
    return {error: error};
  }
}
```

Which we can use like so:

```javascript
/**
 * App.react.js
 */

const ErrorBoundary = require('ErrorBoundary');
const React = require('React');

const MainContent = require('./MainContent.react');
const SecondaryContent = require('./SecondaryContent.react');

function App() {
  return (
    // Render an ErrorSection if an error occurs within
    // MainContent or SecondaryContent
    <ErrorBoundary fallback={error => <ErrorUI error={error} />}>
      <MainContent />
      <SecondaryContent />
    </ErrorBoundary>
  );
}
```

-   We can use the Error Boundary to wrap subtrees and show a different UI when an error occurs within that subtree. When an error occurs, the specified `fallback` will be rendered instead of the content inside the boundary.
-   Note that we can also control the granularity at which we render error UIs, by wrapping components at different levels with error boundaries. In this example, if any error occurs within `MainContent` or `SecondaryContent`, we will render an `ErrorSection` in place of the entire app content.

#### Retrying after an Error

In order to retry fetching a query after an error has occurred, we can attempt to re-mount the query component that produced an error:

```javascript
/**
 * ErrorBoundaryWithRetry.react.js
 */

const React = require('React');

type State = {|error: ?Error|};

// Sample ErrorBoundary that supports retrying to render the content
// that errored
class ErrorBoundaryWithRetry extends React.Component<Props, State> {
  state = {error: null};

  static getDerivedStateFromError(error): State {
    return {error: error};
  }

  _retry = () => {
    this.setState({error: null});
  }

  render() {
    const {children, fallback} = this.props;
    const {error} = this.state;
    if (error) {
      if (typeof fallback === 'function') {
        return fallback(error, this._retry);
      }
      return fallback;
    }
    return children;
  }
}
```

```javascript
/**
 * App.react.js
 */

const ErrorBoundary = require('ErrorBoundary');
const React = require('React');

const MainContent = require('./MainContent.react');

function App() {
  return (
    <ErrorBoundaryWithRetry
      fallback={(error, retry) =>
        <>
          <ErrorUI error={error} />
          <Button
            // Render a button to retry; this will attempt to re-render the
            // content inside the boundary, i.e. the query component
            onClick={retry}
          >Retry</Button>
        </>
      }>
      <MainContent />
    </ErrorBoundaryWithRetry>
  );
}
```

-   The sample Error Boundary in this example code will provide a `retry` function to re-attempt to render the content that originally produced the error. By doing so, we will attempt to re-render our query component (that uses `useLazyLoadQuery`), and consequently attempt to fetch the query again.

#### Accessing errors in GraphQL Response

By default, Relay will **_only_** surface errors to React that are returned in the top-level [errors field](https://graphql.org/learn/validation/), **if**:

-   the fetch function provided to the [Relay Network](https://relay.dev/docs/en/network-layer) throws or returns an Error.
-   if the top-level `data` field wasn't returned in the response.

If you wish to access error information in your application to display user-friendly messages, the recommended approach is to model and expose the error information as part of your GraphQL schema.

For example, you could expose a field in your schema that returns either the expected result, or an Error object if an error occurred while resolving that field (instead of returning null):

```graphql
type Error {
  # User friendly message
  message: String!
}

type Foo {
  bar: Result | Error
}
```

### Environment

#### Relay Environment Provider

In order to render Relay components, you need to render a `RelayEnvironmentProvider` component at the root of the app:

```javascript
// App root

const {RelayEnvironmentProvider} = require('react-relay/hooks');

function Root() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      {...}
    </RelayEnvironmentProvider>
  );
}
```

-   The `RelayEnvironmentProvider `takes an environment, which it will make available to all descendant Relay components, and which is necessary for Relay to function.

#### Accessing the Relay Environment

If you want to access the _current_ Relay Environment within a descendant of a `RelayEnvironmentProvider` component, you can use the **`useRelayEnvironment`** Hook:

```javascript
const {useRelayEnvironment} = require('react-relay/hooks');

function UserComponent(props: Props) {
  const environment = useRelayEnvironment();

  return (...);
}
```

## Reusing Cached Data for Render

While our app is in use, Relay will accumulate and cache _(for some time)_ the data for the multiple queries that have been fetched throughout usage of our app. Often times, we'll want to be able to reuse and immediately render this data that is locally cached instead of waiting for a network request when fulfilling a query; this is what we'll cover in this section.

Some examples of when this might be useful are:

-   Navigating between tabs in an app, where each app renders a query. If a tab has already been visited, re-visiting the tab should render it instantly, without having to wait for a network request to fetch the data that we've already fetched before.
-   Navigating to a post that was previously rendered on a feed. If the post has already been rendered on a feed, navigating to the post's permalink page should render the post immediately, since all of the data for the post should already be cached.
    -   Even if rendering the post in the permalink page requires more data than rendering the post on a feed, we'd still like to reuse and immediately render as much of the post's data that we already have available locally, without blocking render for the entire post if only a small bit of data is missing.

### Fetch Policies

The first step to reusing locally cached data is to specify a **`fetchPolicy`** for `useLazyLoadQuery`:

```

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
    {id: '4'},
    {fetchPolicy: 'store-or-network'},
  );

  return (
    <h1>{data.user?.name}</h1>
  );
}
```

The provided `fetchPolicy` will determine:

-   _if_ the query should be fulfilled from the local cache, and
-   _if_ a network request should be made to fetch the query from the server, depending on the [availability of the data for that query in the store](#availability-of-cached-data).

By default, Relay will try to read the query from the local cache; if any piece of data for that query is [missing](#presence-of-data) or [stale](#staleness-of-data), it will fetch the entire query from the network. This default `fetchPolicy` is called "**_store-or-network"._**

Specifically, `fetchPolicy` can be any of the following options:

-   **"store-or-network"**: _(default)_ **_will_** reuse locally cached data and will **_only_** send a network request if any data for the query is [missing](#presence-of-data) or [stale](#staleness-of-data). If the query is fully cached, a network request will **_not_** be made.
-   **"store-and-network"**: **_will_** reuse locally cached data and will **_always_** send a network request, regardless of whether any data was [missing](#presence-of-data) or [stale](#staleness-of-data) in the store.
-   **"network-only"**: **_will not_** reuse locally cached data, and will **_always_** send a network request to fetch the query, ignoring any data that might be locally cached and whether it's [missing](#presence-of-data) or [stale](#staleness-of-data).
-   **"store-only"**: **_will only_** reuse locally cached data, and will **_never_** send a network request to fetch the query. In this case, the responsibility of fetching the query falls to the caller, but this policy could also be used to read and operate on data that is entirely [local](#local-data-updates).

Note that the `refetch` function discussed in the [Fetching More Data and Rendering Different Data](#fetching-and-rendering-different-data) section  also takes a `fetchPolicy`.

### Availability of Cached Data

The behavior of the fetch policies described in the [previous section](#fetch-policies) will depend on the availability of the data in the Relay store at the moment we attempt to evaluate a query.

There are 2 main aspects that determine the availability of data, which we will go over in this section:

-   [Presence of data](#presence-of-data)
-   [Staleness of data](#staleness-of-data)

### Presence of Data

An important thing to keep in mind when attempting to reuse data that is cached in the Relay store is to understand the lifetime of that data; that is, if it is present in the store, and for how long it will be.

Data in the Relay store for a given query will generally be present after the query has been fetched for the first time, as long as that query is being rendered on the screen. If we’ve never fetched data for a specific query, then it will be missing from the store.

However, even after we've fetched data for different queries, we can't keep all of the data that we've fetched indefinitely in memory, since over time it would grow to be too large and too stale. In order to mitigate this, Relay runs a process called _Garbage Collection_, in order to delete data that we're no longer using:

#### Garbage Collection in Relay

Specifically, Relay runs garbage collection on the local in-memory store by deleting any data that is no longer being referenced by any component in the app.

However, this can be at odds with reusing cached data; if the data is deleted too soon, before we try to reuse it again later, that will prevent us from reusing that data to render a screen without having to wait on a network request. To address this, this section will cover what you need to do in order to ensure that the data you want to reuse is kept cached for as long as you need it.

##### Query Retention

Retaining a query indicates to Relay that the data for that query and variables shouldn't be deleted (i.e. garbage collected). Multiple callers might retain a single query, and as long as there is at least one caller retaining a query, it won't be deleted from the store.

By default, any query components using useLazyLoadQuery or our other APIs will retain the query for as long as they are mounted. After they unmount, they will release the query, which means that the query might be deleted at any point in the future after that occurs.

If you need to retain a specific query outside of the components lifecycle, you can use the [**`retain`**](#retaining-queries) operation:

```javascript
// Retain query; this will prevent the data for this query and
// variables from being garbage collected by Relay
const disposable = environment.retain(queryDescriptor);

// Disposing of the disposable will release the data for this query
// and variables, meaning that it can be deleted at any moment
// by Relay's garbage collection if it hasn't been retained elsewhere
disposable.dispose();
```

-   As mentioned, this will allow you to retain the query even after a query component has unmounted, allowing other components, or future instances of the same component, to reuse the retained data.

##### Controlling Relay's Garbage Collection Policy

There are currently 2 options you can provide to your Relay Store in to control the behavior of garbage collection:

###### GC Scheduler

The **`gcScheduler`** is a function you can provide to the Relay Store which will determine when a GC execution should be scheduled to run:

```javascript
// Sample scheduler function
// Accepts a callback and schedules it to run at some future time.
function gcScheduler(run: () => void) {
  resolveImmediate(run);
}

const store = new Store(source, {gcScheduler});
```

-   By default, if a `gcScheduler` option is not provided, Relay will schedule garbage collection using the `resolveImmediate` function.
-   You can provide a scheduler function to make GC scheduling less aggressive than the default, for example based on time or [scheduler](https://github.com/facebook/react/tree/main/packages/scheduler) priorities, or any other heuristic. By convention, implementations should not execute the callback immediately.

###### GC Release Buffer Size

The Relay Store internally holds a release buffer to keep a specific (configurable) number of queries temporarily retained even after they have been released by their original owner  (i.e., usually when a component rendering that query unmounts). This makes it possible (and more likely) to reuse data when navigating back to a page, tab or piece of content that has been visited before.

In order to configure the size of the release buffer, you can provide a **`gcReleaseBufferSize`** option to the Relay Store:

```javascript
const store = new Store(source, {gcReleaseBufferSize: 10});
```

-   Note that having a buffer size of 0 is equivalent to not having the release buffer, which means that queries will be immediately released and collected.

### Staleness of Data

Assuming our data is [present in the store](#presence-of-data), we still need to consider the staleness of such data.

By default, Relay will never consider data in the store to be stale (regardless of how long it has been cached for), unless it’s explicitly marked as stale using our data invalidation apis.

Marking data as stale is useful for cases when we explicitly know that some data is no longer fresh (for example after executing a [Mutation](#graphql-mutations)), and we want to make sure it get’s refetched with the latest value from the server. Specifically, when data has been marked as stale, if any query references the stale data, that means the query will also be considered stale, and it will need to be fetched again the next time it is evaluated, given the provided [Fetch Policy](#fetch-policies).

Relay exposes the following APIs to mark data as stale within an update to the store:

#### Globally Invalidating the Relay Store

The coarsest type of data invalidation we can perform is invalidating the whole store, meaning that all currently cached data will be considered stale after invalidation.

To invalidate the store, we can call **`invalidateStore()`** within an [updater](#updater-functions) function:

```javascript
function updater(store) {
  store.invalidateStore();
}
```

-   Calling `invalidateStore()` will cause **_all_** data that was written to the store before invalidation occurred to be considered stale, and will require any query to be refetched again the next time it’s evaluated.
-   Note that an updater function can be specified as part of a [mutation](#graphql-mutations), [subscription](#graphql-subscriptions) or just a [local store update](#local-data-updates).

#### Invalidating Specific Data in the Store

We can also be more granular about which data we invalidate and only invalidate _specific records_ in the store; compared to global invalidation, only queries that reference the invalidated records will be considered stale after invalidation.

To invalidate a record, we can call **`invalidateRecord()`** within an [updater](#updater-functions) function:

```javascript
function updater(store) {
  const user = store.get('<id>');
  if (user != null) {
    user.invalidateRecord();
  }
}
```

-   Calling `invalidateRecord()` on the user record will mark _that_ specific user in the store as stale. That means that any query that is cached and references that invalidated user will now be considered stale, and will require to be refetched again the next time it’s evaluated.
-   Note that an updater function can be specified as part of a [mutation](#graphql-mutations), [subscription](#graphql-subscriptions) or just a [local store update](#local-data-updates).

#### Subscribing to Data Invalidation

Just marking the store or records as stale will cause queries to be refetched the next time they are evaluated; so for example, the next time you navigate back to a page that renders a stale query, the query will be refetched even if the data is cached, since the query references stale data.

This is useful for a lot of use cases, but there are some times when we’d like to immediately refetch some data upon invalidation, for example:

-   When invalidating data that is already visible in the current page. Since no navigation is occurring, we won’t re-revaluate the queries for the current page, so even if some data is stale, it won't be immediately refetched and we will be showing stale data.
-   When invalidating data that is rendered on a previous view that was never unmounted; since the view wasn't unmounted, if we navigate back, the queries for that view wont be re-evaluated, meaning that even if some is stale, it won't be refetched and we will be showing stale data.

To support these use cases, Relay exposes the **`useSubscribeToInvalidationState`** hook:

```javascript
function ProfilePage(props) {
  // Example of querying data for the current page for a given user
  const data = usePreloadedQuery(
    graphql`...`,
    props.preloadedQuery,
  )

  // Here we subscribe to changes in invalidation state for the given user ID.
  // Whenever the user with that ID is marked as stale, the provided callback will
  // be executed*
  useSubscribeToInvalidationState([props.userID], () => {
    // Here we can do things like:
    // - re-evaluate the query by passing a new preloadedQuery to usePreloadedQuery.
    // - imperatively refetch any data
    // - render a loading spinner or gray out the page to indicate that refetch
    //   is happening.
  })

  return (...);
}
```

-   `useSubscribeToInvalidationState` takes an array of ids, and a callback. Whenever any of the records for those ids are marked as stale, the provided callback will fire.
-   Inside the callback, we can react accordingly and refetch and/or update any current views that are rendering stale data. As an example, we could re-execute the top-level `usePreloadedQuery` by keeping the `preloadedQuery` in state and setting a new one here; since that query is stale at that point, the query will be refetched even if the data is cached in the store.

### Rendering Partially Cached Data [HIGHLY EXPERIMENTAL]

<blockquote>
<strong>NOTE:</strong> Partial rendering behavior is still highly experimental and likely to change, and only enabled under an experimental option. If you still wish to use it, you can enable it by passing <pre>{"{"}'{"{"}UNSTABLE_renderPolicy: "partial"{"}"}'{"}"}</pre> as an option to <pre>useLazyLoadQuery</pre>.
</blockquote>

Often times when dealing with cached data, we'd like the ability to perform partial rendering. We define _"partial rendering"_ as the ability to immediately render a query that is partially cached. That is, parts of the query might be missing, but parts of the query might already be cached. In these cases, we want to be able to immediately render the parts of the query that are cached, without waiting on the full query to be fetched.

This can be useful in scenarios where we want to render a screen or a page as fast as possible, and we know that some of the data for that page is already cached, so we can skip a loading state. For example, imagine a user profile page: it is very likely that the user's name has already been cached at some point during usage of the app, so when visiting a profile page, if the name of the user is cached, we'd like to render immediately, even if the rest of the data for the profile page isn't available yet.

#### Fragments as boundaries for partial rendering

To do this, we rely on the ability of fragment containers to [_suspend_](#loading-states-with-suspense). **_A fragment container will suspend if any of the data it declared locally is missing during render, and is currently being fetched._** Specifically, it will suspend until the data it requires is fetched, that is, until the query it belongs to (its _parent query_) is fetched.

Let's explain what this means with an example. Say we have the following fragment component:

```javascript
/**
 * UsernameComponent.react.js
 *
 * Fragment Component
 */

import type {UsernameComponent_user$key} from 'UsernameComponent_user.graphql';

const React = require('React');
const {graphql, useFragment} = require('react-relay/hooks');

type Props = {|
  user: UsernameComponent_user$key,
|};

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

And we have the following query component, which queries for some data, and also includes the fragment above:

```javascript
/**
 * App.react.js
 *
 * Query Component
 */

const React = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

const UsernameComponent = require('./UsernameComponent.react');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
          ...UsernameComponent_user
        }
      }
    `,
    {id: '4'},
    {fetchPolicy: 'store-or-network'},
  );

  return (
    <>
      <h1>{data.user?.name}</h1>
      <UsernameComponent user={data.user} />
    </>
  );
}
```

Say that when this `App` component is rendered, we've already previously fetched _(_only_)_ the **`name`** for the `User` with `{id: 4}`, and it is locally cached in the Relay Store.

If we attempt to render the query with a `fetchPolicy` that allows reusing locally cached data (`'store-or-network'`, or `'store-and-network'`), the following will occur:

-   The query will check if any of its locally required data is missing. In this case, **_it isn't_**. Specifically, the query is only directly querying for the `name`, and the name _is_ available, so as far as the query is concerned, none of the data it requires to render **_itself_** is missing. This is important to keep in mind: when rendering a query, we eagerly read out data and render the tree, instead of blocking rendering of the entire tree until _all_ of the data for the query (i.e. including nested fragments) is fetched. As we render, **_we will consider data to be missing for a component if the data it declared locally is missing, i.e. if any data required to render the current component is missing, and _not_ if data for descendant components is missing._**
-   Given that the query doesn't have any data missing, it will render, and then attempt to render the child `UsernameComponent`.
-   When the `UsernameComponent` attempts to render the `UsernameComponent_user` fragment, it will notice that some of the data required to render itself is missing; specifically, the **`username`** is missing. At this point, since `UsernameComponent` has missing data, it will suspend rendering until the network request completes. Note that regardless of which `fetchPolicy` you choose, a network request will always be started if any piece of data for the full query, i.e. including fragments, is missing.

At this point, when `UsernameComponent` suspends due to the missing **`username`**, ideally we should still be able to render the `User`'s `**name**` immediately, since it's locally cached. However, since we aren't using a `Suspense` component to catch the fragment's suspension, the suspension will bubble up and the entire `App` component will be suspended.

In order to achieve the desired effect of rendering the **`name`** when it's available even if the **`username`**  is missing, we just need to wrap the `UsernameComponent` in `Suspense,` to _allow_ the other parts of `App` to continue rendering:

```javascript
/**
 * App.react.js
 *
 * Query Component
 */

const React = require('React');
const {Suspense} = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

const UsernameComponent = require('./UsernameComponent.react');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
          ...UsernameComponent_user
        }
      }
    `,
    {id: '4'},
    {fetchPolicy: 'store-or-network'},
  );

  return (
    <>
      <h1>{data.user?.name}</h1>

      <Suspense
        // Wrap the UserComponent in Suspense to allow other parts of the
        // App to be rendered even if the username is missing.
        fallback={<LoadingSpinner label="Fetching username" />}
      >
        <UsernameComponent user={data.user} />
      </Suspense>
    </>
  );
}
```

* * *

The process that we described above works the same way for nested fragments (i.e. fragments that include other fragments). This means that if the data required to render a fragment is locally cached, the fragment component will be able to render, regardless of whether data for any of its child or descendant fragments is missing. If data for a child fragment is missing, we can wrap it in a `Suspense` component to allow other fragments and parts of the app to continue rendering.

### Filling in Missing Data (Missing Data Handlers)

In the previous section we covered how to reuse data that is fully or partially cached, however there are cases in which Relay can't automatically tell that it can reuse some of its local data to fulfill a query. Specifically, Relay knows how to reuse data that is cached for the _same_ query; that is, if you fetch the exact same query twice, Relay will know that it has the data cached for that query the second time.

However, when using different queries, there might still be cases where different queries point to the same data, which we'd want to be able to reuse. For example, imagine the following two queries:

```graphql
// Query 1
query UserQuery {
  user(id: 4) {
    name
  }
}
```

```

// Query 2
query NodeQuery {
  node(id: 4) {
    ... on User {
      name
    }
  }
}
```

These two queries are different, but reference the exact same data. Ideally, if one of the queries was already cached in the store, we should be able to reuse that data when rendering the other query. However, Relay doesn't have this knowledge by default, so we need to configure it to encode the knowledge that a `node(id: 4)` **_"is also a"_** `user(id: 4)`.

To do so, we can provide **`missingFieldHandlers`** to the `RelayEnvironment`, which specify this knowledge:

```javascript
const {ROOT_TYPE, Environment} = require('react-relay');

const missingFieldHandlers = [
  {
    handle(field, record, argValues): ?string {
      if (
        record != null &&
        record.__typename === ROOT_TYPE &&
        field.name === 'user' &&
        argValues.hasOwnProperty('id')
      ) {
        // If field is user(id: $id), look up the record by the value of $id
        return argValues.id;
      }
      if (
        record != null &&
        record.__typename === ROOT_TYPE &&
        field.name === 'story' &&
        argValues.hasOwnProperty('story_id')
      ) {
        // If field is story(story_id: $story_id), look up the record by the
        // value of $story_id.
        return argValues.story_id;
      }
      return undefined;
    },
    kind: 'linked',
  },
];

const environment = new Environment({
  // and other fields
  missingFieldHandlers,
});
```

-   `missingFieldHandlers` is an array of _handlers_. Each handler must specify a `handle` function, and the kind of missing fields it knows how to handle. The 2 main types of fields that you'd want to handle are:
    -   **_'scalar'_**: This represents a field that contains a scalar value, for example a number or a string.
    -   **_'linked'_**: This represents a field that references another object, i.e. not a scalar.
-   The `handle` function takes the field that is missing, the record that field belongs to, and any arguments that were passed to the field in the current execution of the query.
    -   When handling a **_'scalar'_** field, the handle function should return a scalar value, in order to use as the value for a missing field
    -   When handling a **_'linked'_** field, the handle function should return an **_ID_**, referencing another object in the store that should be use in place of the missing field.
-   As Relay attempts to fulfill a query from the local cache, whenever it detects any missing data, it will run any of the provided missing field handlers that match the field type before definitively declaring that the data is missing.

## Fetching Rendering _Different_ Data

After an app has been initially rendered, there are various scenarios in which you might want to fetch and render more data, re-render your UI with _different_ data, or maybe refresh existing data, usually as a result of an event or user interaction.

In this section we'll cover some of the most common scenarios and how to build them with Relay.

### Refreshing Rendered Data

Assuming you're not using real-time updates to update your data (e.g. using [GraphQL Subscriptions](#graphql-subscriptions)), often times you'll want to refetch the same data you've already rendered, in order to get the latest version available on the server. This is what we'll cover in this section.

#### Refreshing Queries

To refresh a query, you can use the **`fetchQuery`** function described in our [Fetching Queries](#fetching-queries) section. Specifically, you can call `fetchQuery` inside the component with the exact same query and variables. Given that the query component is subscribed to any changes in its own data, when the request completes, the component will automatically update and re-render with the latest data:

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {graphql, useLazyLoadQuery, useRelayEnvironment, fetchQuery} = require('react-relay/hooks');

function App() {
  const environment = useRelayEnvironment();
  const variables = {id: '4'};
  const appQuery = graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
        friends {
          count
        }
      }
    }
  `;

  const refresh = () => {
    fetchQuery(
      environment,
      appQuery,
      variables,
    )
    .toPromise();
  };

  const data = useLazyLoadQuery<AppQuery>(appQuery, variables);

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button onClick={() => refresh()}>Fetch latest count</Button>
    </>
  );
}
```

If you want to know whether the request is in flight, in order to show a busy indicator or disable a UI control, you can subscribe to the observable returned by `fetchQuery`, and keep state in your component:

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {useState} = require('React');
const {graphql, useLazyLoadQuery, useRelayEnvironment, fetchQuery} = require('react-relay/hooks');

function App() {
  const environment = useRelayEnvironment();
  const variables = {id: '4'};
  const appQuery = graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
        friends {
          count
        }
      }
    }
  `;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    fetchQuery(
      environment,
      appQuery,
      variables,
    )
    .subscribe({
      start: () => setIsRefreshing(true),
      complete: () => setIsRefreshing(false),
    });
  };

  const data = useLazyLoadQuery<AppQuery>(appQuery, variables);

  return (
    <>
      <h1>{data.user?.name}</h1>
      <div>Friends count: {data.user.friends?.count}</div>
      <Button
        disabled={isRefreshing}
        onClick={() => refetch()}>
        Fetch latest count {isRefreshing ? <LoadingSpinner /> : null}
      </Button>
    </>
  );
}
```

#### Refreshing Fragments

In order to refresh the data for a fragment, we can also use `fetchQuery`, but we need to provide a query to refetch the fragment under; remember, **_fragments can't be fetched by themselves: they need to be part of a query,_** so we can't just "fetch" the fragment again by itself.

However, we don't need to manually write the query; instead, we can use the **`@refetchable`** directive, which will make it so Relay automatically generates a query to fetch the fragment when the compiler is run:

```javascript
import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');
const {graphql, useFragment, useRelayEnvironment} = require('react-relay/hooks');

// This query is autogenerated by Relay given @refetchable used below
const UserComponentUserRefreshQuery = require('UserComponentUserRefreshQuery.graphql');

type Props = {|
  user: UserComponent_user$key,
|};

function UserComponent(props: Props) {
  const environment = useRelayEnvironment();
  const data = useFragment(
     graphql`
      fragment UserComponent_user on User
        # @refetchable makes it so Relay autogenerates a query for
        # fetching this fragment
        @refetchable(queryName: "UserComponentUserRefreshQuery") {
        id
        name
        friends {
          count
        }
      }
    `,
    props.user,
  );

  const refresh = () => {
    fetchQuery(
      environment,
      UserComponentUserRefreshQuery,
      {id: data.id},
    )
    .toPromise();
  };

  return (
    <>
      <h1>{data.name}</h1>
      <div>Friends count: {data.friends?.count}</div>
      <Button onClick={() => refresh()}>Fetch latest count</Button>
    </>
  );
}

module.exports = UserComponent;
```

-   Relay will autogenerate a query by adding the `@refetchable` directive to our fragment, and we can import it and pass it to `fetchQuery`. Note that `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, or on `Query`, or on a type that implements `Node` (i.e. a type that has an `id` field).
-   In order to fetch the query, we need to know the `id` of the user since it will be a required query variable in the generated query. To do so, we simply include the `id` in our fragment.
-   Given that the fragment container component is subscribed to any changes in its own data, when the request completes, the component will automatically update and re-render with the latest data:
-   If you want to know whether the request is in flight, in order to show a busy indicator or disable a UI control, you can use provide an `observer` to `fetchQuery`, and keep state in your component.

### Re-rendering with Different Data

Often times you'll want to re-render your existing query or fragment components, but using _different_ data than the one they were originally rendered with. This usually means fetching your existing queries or fragments with _different variables_.

Some examples of when you might want to do this:

-   You've rendered a comment, and after user interaction want to fetch and re-render the comment body with the text translated to a different language.
-   You've rendered a profile picture, and you want to fetch and re-render it with a different size or scale.
-   You've rendered a list of search results, and you want to fetch and re-render the list with a new search term upon user input.

#### Re-rendering queries with different data

As mentioned in the [Queries](#queries) section, passing **_different query variables_** than the ones originally passed when using `useLazyLoadQuery` will cause the query to be fetched with the new variables, and re-render your component with the new data:

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {useState, useTransition} = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

function App() {
  const [startTransition] = useTransition();
  const [variables, setVariables] = useState({id: '4'});

  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    variables,
  );

  return (
    <>
      <h1>
        {data.user?.name}
        <Button
          onClick={() => {
            startTransition(() => {
              setVariables({id: 'different-id'});
            });
          }}>
          Fetch different User
        </Button>
      </h1>
    </>
  );
}
```

Let's distill what's going on here:

-   Calling `setVariables` and passing a new set of variables will re-render the component and cause the query to be fetched again **_with the newly provided variables_**. In this case, we will fetch the `User` with id `'different-id'`, and render the results when they're available.
-   This will re-render your component and may cause it to suspend (as explained in ([Transitions And Updates That Suspend](#transitions-and-updates-that-suspend)) if it needs to send and wait for a network request. If `setVariables` causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense config in order to show the appropriate pending or loading state.
    -   Note that since `setVariables` may cause the component to suspend, regardless of whether we're using a Suspense config to render a pending state, we should always use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.

You can also provide a different **`fetchPolicy`** when refetching the query in order to specify whether to use locally cached data (as we covered in [Reusing Cached Data for Render](#reusing-cached-data-for-render)):

```javascript
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');
const {useState, useTransition} = require('React');
const {graphql, useLazyLoadQuery} = require('react-relay/hooks');

function App() {
  const [startTransition] = useTransition();
  const [state, setState] = useState({
    fetchPolicy: 'store-or-network',
    variables: {id: '4'},
  });

  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    variables,
    {fetchPolicy},
  );

  return (
    <>
      <h1>
        {data.user?.name}
        <Button
          onClick={() => {
            startTransition(() => {
              setState({
                fetchPolicy: 'network-only',
                variables: {id: 'different-id'},
              });
            });
          }}>
          Fetch different User
        </Button>
      </h1>
    </>
  );
}
```

-   In this case, we're keeping both the `fetchPolicy` and `variables` in component state in order to trigger a refetch both with different `variables` and a different `fetchPolicy`.

#### Re-rendering Fragments with Different Data

Sometimes, upon an event or user interaction, we'd like to render the _same_ exact fragment that was originally rendered under the initial query, but with a different data. Conceptually, this means fetching and rendering the currently rendered fragment again, but under a new query with different variables; or in other words, _making the rendered fragment a new query root_. Remember that **_fragments can't be fetched by themselves: they need to be part of a query,_** so we can't just "fetch" the fragment again by itself.

To do so, you can use the **`useRefetchableFragment`** hook, in order to refetch a fragment under new query and variables, using the **`refetch`** function:

```javascript
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

const React = require('React');
const {useTransition} = require('React')
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
            refetch({lang: 'SPANISH'}, {fetchPolicy: 'store-or-network'});
          });
        }}>
        Translate Comment
      </Button>
    </>
  );
}

module.exports = CommentBody;
```

Let's distill what's happening in this example:

-   `useRefetchableFragment` behaves the same way as a `useFragment` ([Fragments](#fragments)), but with a few additions:
    -   It expects a fragment that is annotated with the `@refetchable` directive. Note that  `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, or on `Query`, or on a type that implements `Node` (i.e. a type that has an `id` field).
    -   It returns a **`refetch`** function, which is already Flow typed to expect the query variables that the generated query expects
    -   It takes to Flow type parameters: the type of the generated query (in our case  `CommentBodyRefetchQuery`), and a second type which can always be inferred, so you only need to pass underscore (`_`).
-   Calling `refetch` and passing a new set of variables will fetch the fragment again **_with the newly provided variables_**. The variables you need to provide are a subset of the variables that the generated query expects; the generated query will require an `id`, if the type of the fragment has an `id` field, and any other variables that are transitively referenced in your fragment.
    -   In this case we're passing the current comment `id` and a new value for the `translationType` variable to fetch the translated comment body.
-   This will re-render your component and may cause it to suspend (as explained in [Transitions And Updates That Suspend](#transitions-and-updates-that-suspend)) if it needs to send and wait for a network request. If `refetch` causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense config in order to show the appropriate pending state.
    -   Note that since `refetch` may cause the component to suspend, regardless of whether we're using a Suspense config to render a pending state, we should always use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.

## Rendering List Data and Pagination

There are several scenarios in which we'll want to query a list of data from the GraphQL server. Often times we won't want to query the _entire_ set of data up front, but rather discrete sub-parts of the list, incrementally, usually in response to user input or other events. Querying a list of data in discrete parts is usually known as [Pagination](https://graphql.org/learn/pagination/).

### Connections

Specifically in Relay, we do this via GraphQL fields known as [Connections](https://graphql.org/learn/pagination/#complete-connection-model). Connections are GraphQL fields that take a set of arguments to specify which "slice" of the list to query, and include in their response both the "slice" of the list that was requested, as well as information to indicate if there is more data available in the list and how to query it; this additional information can be used in order to perform pagination by querying for more "slices" or pages on the list.

More specifically, we perform _cursor-based pagination,_ in which the input used to query for "slices" of the list is a `cursor` and a `count`. Cursors are essentially opaque tokens that serve as markers or pointers to a position in the list. If you're curious to learn more about the details of cursor-based pagination and connections, check out [this spec](https://relay.dev/graphql/connections.htm).

### Rendering Connections

In Relay, in order to perform pagination, first you need to declare a fragment that queries for a connection:

```javascript
const {graphql} = require('react-relay');

const userFragment = graphql`
  fragment UserFragment on User {
    name
    friends(after: $cursor, first: $count)
      @connection(key: "UserFragment_friends") {
      edges {
        node {
          ...FriendComponent
        }
      }
    }
  }
`;
```

-   In the example above, we're querying for the `friends` field, which is a connection; in other words, it adheres to the connection spec. Specifically, we can query the `edges` and `node`s in the connection; the `edges` usually contain information about the relationship between the entities, while the `node`s are the actual entities at the other end of the relationship; in this case, the `node`s are objects of type `User` representing the user's friends.
-   In order to indicate to Relay that we want to perform pagination over this connection, we need to mark the field with the `@connection` directive. We must also provide a _static_ unique identifier for this connection, known as the **`key`**. We recommend the following naming convention for the connection key: `<fragment_name>_<field_name>`.
-   We will go into more detail later as to why it is necessary to mark the field as a `@connection` and give it a unique `key` in our [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection) section.

In order to render this fragment which queries for a connection, we can use the **`usePaginationFragment`** Hook:

```javascript
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense, SuspenseList} = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const {data} = usePaginationFragment<FriendsListPaginationQuery, _>(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends") {
          edges {
            node {
              ...FriendComponent
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
      <SuspenseList revealOrder="forwards">
        {
          // Extract each friend from the resulting data
          (data.friends?.edges ?? []).map(edge => {
            const node = edge.node;
            return (
              <Suspense fallback={<Glimmer />}>
                <FriendComponent user={node} />
              </Suspense>
            );
          })
        }
      </SuspenseList>
    </>
  );
}

module.exports = FriendsListComponent;
```

-   `usePaginationFragment` behaves the same way as a `useFragment` ([Fragments](#fragments)), so our list of friends is available under **`data.friends.edges.node`**, as declared by the fragment. However, it also has a few additions:
    -   It expects a fragment that is a connection field annotated with the `@connection` directive
    -   It expects a fragment that is annotated with the `@refetchable` directive. Note that  `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, or on `Query`, or on a type that implements `Node` (i.e. a type that has an `id` field).
    -   It takes two Flow type parameters: the type of the generated query (in our case  `FriendsListPaginationQuery`), and a second type which can always be inferred, so you only need to pass underscore (`_`).
-   Note that we're using `[SuspenseList](https://reactjs.org/docs/concurrent-mode-patterns.html#suspenselist)` to render the items: this will ensure that the list is rendered in order from top to bottom even if individual items in the list suspend and resolve at different times; that is, it will prevent items from rendering out of order, which prevents content from jumping around after it has been rendered.

### Pagination

To actually perform pagination over the connection, we need use the **`loadNext`** function to fetch the next page of items, which is available from `usePaginationFragment`:

```javascript
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense, SuspenseList, useTransition} = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const [startTransition] = useTransition();
  const {data, loadNext} = usePaginationFragment<FriendsListPaginationQuery, _>(
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
      <SuspenseList revealOrder="forwards">
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </SuspenseList>

      <Button
        onClick={() => {
          startTransition(() => {
            loadNext(10)
          });
        }}>
        Load more friends
      </Button>
    </>
  );
}

module.exports = FriendsListComponent;
```

Let's distill what's happening here:

-   **`loadNext`** takes a count to specify how many more items in the connection to fetch from the server. In this case, when `loadNext` is called we'll fetch the next 10 friends in the friends list of our currently rendered `User`.
-   When the request to fetch the next items completes, the connection will be automatically updated and the component will re-render with the latest items in the connection. In our case, this means that the `friends` field will always contain _all_ of the friends that we've fetched so far. By default, **_Relay will automatically append new items to the connection upon completing a pagination request,_** and will make them available to your fragment component. If you need a different behavior, check out our [Advanced Pagination Use Cases](#advanced-pagination-use-cases) section.
-   `loadNext` may cause the component or new children components to suspend (as explained in [Transitions And Updates That Suspend](#transitions-and-updates-that-suspend)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense config in order to show the appropriate pending or loading state.
    -   Note that since `loadNext` may cause the component to suspend, regardless of whether we're using a Suspense config to render a pending state, we should always use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.

Often, you will also want to access information about whether there are more items available to load. To do this, you can use the `hasNext` value, also available from `usePaginationFragment`:

```javascript
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense, SuspenseList, useTransition} = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const [startTransition] = useTransition();
  const {
    data,
    loadNext,
    hasNext,
  } = `usePaginationFragment``<``FriendsListPaginationQuery``,`` _``>`(
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
      <SuspenseList revealOrder="forwards">
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </SuspenseList>

      {
        // Only render button if there are more friends to load in the list
        hasNext ? (
          <Button
            onClick={() => {
              startTransition(() => {
                loadNext(10)
              });
            }}>
            Load more friends
          </Button>
        ) : null}
    </>
  );
}

module.exports = FriendsListComponent;
```

-   `hasNext` is a boolean which indicates if the connection has more items available. This information can be useful for determining if different UI controls should be rendered. In our specific case, we only render the `Button` if there are more friends available in the connection.

### Blocking ("all-at-once") Pagination

So far when we've talked about pagination, we haven't specified how we want pagination to behave when we're rendering the new items we've fetched. Since the new items that we're fetching and rendering might individually suspend due to their own asynchronous dependencies ([Loading States with Suspense](#loading-states-with-suspense)), we need to be able to specify what kind of behavior we want to have as we render them.

Usually, we've identified that this will fall under one of these 2 categories:

-   **_"One by one"_** (or "stream-y") pagination: Regardless of whether we're actually streaming at the data layer, conceptually this type of pagination is where we want to render items one by one, in order, as they become available. In this use case, we usually want to show some sort of loading placeholder for the new items (either in aggregate or for each individual item) as they are loaded in. This should not exclude the possibility of _also_ having a _separate_ [pending or busy state](https://reactjs.org/docs/concurrent-mode-patterns.html#the-three-steps) (like a spinner next to the button that started the action). This is generally the default pagination behavior that we'll want, which applies to most lists and feeds.
-   **_"All at once"_** pagination: This type of pagination is where we want to load and render the entire next page of items _all at once,_ in a **_single paint_**; that is, we want to render the next page of items only when _all_ of the items are ready (including when individual items suspend). Unlike the previous case, in this case, we do not want to show individual placeholders for the new items in the list, but instead we want to immediately show a [pending or busy state](https://reactjs.org/docs/concurrent-mode-patterns.html#the-three-steps), such as a spinner next (or close) to the element that started the action (like a button); this pending spinner should continue "spinning" until the entire next page of items are _fully_ loaded and rendered. The best example of this type of use case is pagination when loading new comments in a list of comments.

So far in the previous pagination sections, we've implicitly been referring to the **_"one by one"_** pagination case when describe using `usePaginationFragment` + `SuspenseList` to render lists and show loading placeholders.

However, if we want to implement **_"all at once"_** pagination, we need to use a different API, **`useBlockingPaginationFragment`**:

```javascript
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {useTransition, Suspense, SuspenseList} = require('React');

const {graphql, useBlockingPaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: FriendsListComponent_user$key,
|};

const SUSPENSE_CONFIG = {
  // timeoutMs allows us to delay showing the "loading" state for a while
  // in favor of showing a "pending" state that we control locally
  timeoutMs: 30 * 1000,
};

function FriendsListComponent(props: Props) {
  // isPending captures the "pending" state. It will become true
  // **immediately** when the pagination transition starts, and will be set back
  // to false when the transition reaches the fully "completed" stage
  // (i.e. when all the new items in the list have fully loaded and rendered)
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG);
  const {
    data,
    loadNext,
    hasNext,
  } = useBlockingPaginationFragment<FriendsListPaginationQuery, _>(
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
      <SuspenseList revealOrder="forwards">
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </SuspenseList>

      {
        // Render a Spinner next to the button immediately, while transition is pending
        isPending ? <Spinner /> : null
      }

      {hasNext ? (
        <Button
          // Disable the button immediately, while transition is pending
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              loadNext(10)
            });
          }}>
          Load more friends
        </Button>
      ) : null}
    </>
  );
}

module.exports = FriendsListComponent;
```

Let's distill what's going on here:

-   `loadNext` will cause the component to suspend, so we need to wrap it in `startTransition`, as explained in [Transitions And Updates That Suspend](#transitions-and-updates-that-suspend)).
-   Also similarly to the case described in [Transitions And Updates That Suspend](#transitions-and-updates-that-suspend), we're passing the **`SUSPENSE_CONFIG`** config object to `useTransition` in order to configure how we want this transition to behave. Specifically, we can pass a **`timeoutMs`** property in the config, which will dictate how long React should wait before transitioning to the _"loading"_ state (i.e. transition to showing the loading placeholders for the new items), in favor of showing a _"pending"_ state controlled locally by the component during that time.
-   `useTransition` will also return a **`isPending`** boolean value, which captures the pending state. That is, this value will become `true` **_immediately_** when the pagination transition starts, and will become `false` when the transition reaches the fully _"completed"_ stage, that is, when all the new items have been _fully_ loaded, including their own asynchronous dependencies that would cause them to suspend. We can use the `isPending` value to show immediate post to the user action, in this case by rendering a spinner next to the button and disabling the button. In this case, the spinner will be rendered and the button will be disabled until _all_ the new items in the list have been fully loaded and rendered.

### Using and Changing Filters

Often times when querying for a list of data, you can provide different values in the query which serve as filters that change the result set, or sort it differently.

Some examples of this are:

-   Building a search typeahead, where the list of results is a list filtered by the search term entered by the user.
-   Changing the ordering mode of the list comments currently displayed for a post, which could produce a completely different set of comments from the server.
-   Changing the way News Feed is ranked and sorted.

Specifically, in GraphQL, connection fields can accept arguments to sort or filter the set of queried results:

```graphql
fragment UserFragment on User {
  name
  friends(order_by: DATE_ADDED, search_term: "Alice", first: 10) {
    edges {
      node {
        name
        age
      }
    }
  }
}
```

In Relay, we can pass those arguments as usual using GraphQL [Variables](#variables).

```javascript
type Props = {|
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const userRef = props.userRef;

  const {data, ...} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(
          order_by: $orderBy,
          search_term: $searchTerm,
          after: $cursor,
          first: $count,
        ) @connection(key: "FriendsListComponent_user_friends_connection") {
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

  return (...);
}
```

When paginating, the original values for those filters will be preserved:

```javascript
type Props = {|
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const userRef = props.userRef;

  const {data, loadNext} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(order_by: $orderBy, search_term: $searchTerm)
          @connection(key: "FriendsListComponent_user_friends_connection") {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    userRef,
  );

  return (
    <>
      <h1>Friends of {data.name}:</h1>
      <List items={data.friends?.nodes}>{...}</List>

      /*
       Loading the next items will use the original order_by and search_term
       values used for the initial query
    */
      <Button onClick={() => loadNext(10)}>Load more friends</Button>
    </>
  );
}
```

-   Note that calling `loadNext` will use the **_original_** **`order_by`** and **`search_term`** values used for the initial query. During pagination, these value won't (_and shouldn't_) change.

If we want to refetch the connection with _different_ variables, we can use the **`refetch`** function provided by `usePaginationFragment`, similarly to how we do so when [Re-rendering Fragments With Different Data](#re-rendering-fragments-with-different-data):

```javascript
/**
 * FriendsListComponent.react.js
 */
import type {FriendsListComponent_user$ref} from 'FriendsListComponent_user.graphql';

const React = require('React');
const {useState, useEffect, useTransition, SuspenseList} = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  searchTerm?: string,
  user: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const searchTerm = props.searchTerm;
  const [startTransition] = useTransition();
  const {data, loadNext, refetch} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(
          order_by: $orderBy,
          search_term: $searchTerm,
          after: $cursor,
          first: $count,
        ) @connection(key: "FriendsListComponent_user_friends_connection") {
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

  useEffect(() => {
    // When the searchTerm provided via props changes, refetch the connection
    // with the new searchTerm
    startTransition(() => {
      refetch({first: 10, search_term: searchTerm}, {fetchPolicy: 'store-or-network'});
    });
  }, [searchTerm]);

  return (
    <>
      <h1>Friends of {data.name}:</h1>

      <Button
        // When the button is clicked, refetch the connection but sorted differently
        onClick={() =>
          startTransition(() => {
            refetch({first: 10, orderBy: 'DATE_ADDED'});
          })
        }>
        Sort by date added
      </Button>

      <SuspenseList>...</SuspenseList>
      <Button onClick={() => loadNext(10)}>Load more friends</Button>
    </>
  );
}
```

Let's distill what's going on here:

-   Calling **`refetch`** and passing a new set of variables will fetch the fragment again **_with the newly-provided variables_**. The variables you need to provide are a subset of the variables that the generated query expects; the generated query will require an `id`, if the type of the fragment has an `id` field, and any other variables that are transitively referenced in your fragment.
    -   In our case, we need to pass the count we want to fetch as the `first` variable, and we can pass different values for our filters, like `orderBy` or `searchTerm`.
-   This will re-render your component and may cause it to suspend (as explained in [Transitions And Updates That Suspend](#transitions-and-updates-that-suspend)) if it needs to send and wait for a network request. If `refetch` causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense config in order to show the appropriate pending or loading state.
    -   Note that since `refetch` may cause the component to suspend, regardless of whether we're using a Suspense config to render a pending state, we should always use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.
-   Conceptually, when we call refetch, we're fetching the connection _from scratch_. In other words, we're fetching it again from the _beginning_ and **_"resetting"_** our pagination state. For example, if we fetch the connection with a different `search_term`, our pagination information for the previous `search_term` no longer makes sense, since we're essentially paginating over a new list of items.

### Adding and Removing Items From a Connection

Usually when you're rendering a connection, you'll also want to be able to add or remove items to/from the connection in response to user actions.

As explained in our [Updating Data](#updating-data) section, Relay holds a local in-memory store of normalized GraphQL data, where records are stored by their IDs.  When creating mutations, subscriptions, or local data updates with Relay, you must provide an `updater` function, inside which you can access and read records, as well as write and make updates to them. When records are updated, any components affected by the updated data will be notified and re-rendered.

### Connection Records

In Relay, connection fields that are marked with the `@connection` directive are stored as special records in the store, and they hold and accumulate _all_ of the items that have been fetched for the connection so far. In order to add or remove items from a connection, we need to access the connection record using the connection **_`key`_**, which was provided when declaring a `@connection`; specifically, this allows us to access a connection inside an `updater` function using the `ConnectionHandler` APIs.

For example, given the following fragment that declares a `@connection`:

```javascript
const {graphql} = require('react-relay');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments @connection(key: "StoryComponent_story_comments_connection") {
      nodes {
        body {
          text
        }
      }
    }
  }
`;
```

We can access the connection record inside an `updater` function using **`ConnectionHandler.getConnection`**:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // ...
}
```

### Adding Edges

Once we have a connection record, we also need a record for the new edge that we want to add to the connection. Usually, mutation or subscription payloads will contain the new edge that was added; if not, you can also construct a new edge from scratch.

For example, in the following mutation we can query for the newly created edge in the mutation response:

```javascript
const {graphql} = require('react-relay');

const createCommentMutation = graphql`
  mutation CreateCommentMutation($input: CommentCreateData!) {
    comment_create(input: $input) {
      comment_edge {
        cursor
        node {
          body {
            text
          }
        }
      }
    }
  }
`;
```

-   Note that we also query for the **`cursor`** for the new edge; this isn't strictly necessary, but it is information that will be required if we need to perform pagination based on that `cursor`.

Inside an `updater`, we can access the edge inside the mutation response using Relay store APIs:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Get the payload returned from the server
  const payload = store.getRootField('comment_create');

  // Get the edge inside the payload
  const serverEdge = payload.getLinkedRecord('comment_edge');

  // Build edge for adding to the connection
  const newEdge = ConnectionHandler.buildConnectionEdge(
    store,
    connectionRecord,
    serverEdge,
  );

  // ...
}
```

-   The mutation payload is available as a root field on that store, which can be read using the `store.getRootField` API. In our case, we're reading `comment_create`, which is the root field in the response.
-   Note that we need to construct the new edge from the edge received from the server using **`ConnectionHandler.buildConnectionEdge`** before we can add it to the connection.

If you need to create a new edge from scratch, you can use **`ConnectionHandler.createEdge`**:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Create a new local Comment record
  const id = `client:new_comment:${randomID()}`;
  const newCommentRecord = store.create(id, 'Comment');

  // Create new edge
  const newEdge = ConnectionHandler.createEdge(
    store,
    connectionRecord,
    newCommentRecord,
    'CommentEdge', /* GraphQl Type for edge */
  );

  // ...
}
```

Once we have a new edge record, we can add it to the the connection using **`ConnectionHandler.insertEdgeAfter`** or **`ConnectionHandler.insertEdgeBefore`**:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  const newEdge = (...);

  // Add edge to the end of the connection
  ConnectionHandler.insertEdgeAfter(
    connectionRecord,
    newEdge,
  );

  // Add edge to the beginning of the connection
  ConnectionHandler.insertEdgeBefore(
    connectionRecord,
    newEdge,
  );
}
```

-   Note that these APIs will _mutate_ the connection in-place.

### Removing Edges

`ConnectionHandler` provides a similar API to remove an edge from a connection, via **`ConnectionHandler.deleteNode`**:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Remove edge from the connection, given the ID of the node
  ConnectionHandler.deleteNode(
    connectionRecord,
    commentIDToDelete,
  );
}
```

-   In this case `ConnectionHandler.deleteNode` will remove an edge given a **\*`node`** ID\*. This means it will look up which edge in the connection contains a node with the provided ID, and remove that edge.
-   Note that this API will _mutate_ the connection in-place.

<blockquote>
<strong>Remember:</strong> When performing any of the operations described here to mutate a connection, any fragment or query components that are rendering the affected connection will be notified and re-render with the latest version of the connection.
</blockquote>

You can also check out our complete Relay Store APIs [here](https://relay.dev/docs/en/relay-store.html)

### Connection Identity With Filters

In our previous examples, our connections didn't take any arguments as filters. If you declared a connection that takes arguments as filters, the values used for the filters will be part of the connection identifier. In other words, **_each of the values passed in as connection filters will be used to identify the connection in the Relay store_**, however, **_excluding_** pagination arguments; i.e. excluding:  `first:`, `last:`, `before:`, and `after:`.

For example, let's say the `comments` field took the following arguments, which we pass in as GraphQL [Variables](#variables):

```javascript
const {graphql} = require('react-relay');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments(
      order_by: $orderBy,
      filter_mode: $filterMode,
      language: $language,
    ) @connection(key: "StoryComponent_story_comments_connection") {
      edges {
        nodes {
          body {
            text
          }
        }
      }
    }
  }
`;
```

In the example above, this means that whatever values we used for `$orderBy`, `$filterMode` and `$language` when we queried for the `comments` field will be part of the connection identifier, and we'll need to use those values when accessing the connection record from the Relay store.

In order to do so, we need to pass a third argument to **`ConnectionHandler.getConnection`**, with concrete filter values to identify the connection:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);

  // Get the connection instance for the connection with comments sorted
  // by the date they were added
  const connectionRecordSortedByDate = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: 'DATE_ADDED', filter_mode: null, language: null}
  );

  // Get the connection instance for the connection that only contains
  // comments made by friends
  const connectionRecordFriendsOnly = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: null, filter_mode: 'FRIENDS_ONLY', langugage: null}
  );
}
```

This implies that by default, **_each combination of values used for filters will produce a different record for the connection._**

When making updates to a connection, you will need to make sure to update all of the relevant records affected by a change. For example, if we were to add a new comment to our example connection, we'd need to make sure **_not_** to add the comment to the `FRIENDS_ONLY` connection, if the new comment wasn't made by a friend of the user:

```javascript
const {ConnectionHandler} = require('react-relay');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);

  // Get the connection instance for the connection with comments sorted
  // by the date they were added
  const connectionRecordSortedByDate = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: '*DATE_ADDED*', filter_mode: null, language: null}
  );

  // Get the connection instance for the connection that only contains
  // comments made by friends
  const connectionRecordFriendsOnly = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: null, filter_mode: '*FRIENDS_ONLY*', language: null}
  );

  const newComment = (...);
  const newEdge = (...);

  ConnectionHandler.insertEdgeAfter(
    connectionRecordSortedByDate,
    newEdge,
  );

  if (isMadeByFriend(storyRecord, newComment) {
    // Only add new comment to friends-only connection if the comment
    // was made by a friend
    ConnectionHandler.insertEdgeAfter(
      connectionRecordFriendsOnly,
      newEdge,
    );
  }
}
```

_**Managing connections with many filters:**_

As you can see, just adding a few filters to a connection can make the complexity and number of connection records that need to be managed explode. In order to more easily manage this, Relay provides 2 strategies:

1) Specify exactly _which_ filters should be used as connection identifiers.

By default, **_all_** **non-pagination** filters will be used as part of the connection identifier. However, when declaring a `@connection`, you can specify the exact set of filters to use for connection identity:

```javascript
const {graphql} = require('react-relay');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments(
      order_by: $orderBy
      filter_mode: $filterMode
      language: $language
    )
      @connection(
        key: "StoryComponent_story_comments_connection"
        filters: ["order_by", "filter_mode"]
      ) {
      edges {
        nodes {
          body {
            text
          }
        }
      }
    }
  }
`;
```

-   By specifying `filters` when declaring the `@connection`, we're indicating to Relay the exact set of filter values that should be used as part of connection identity. In this case, we're excluding `language`, which means that only values for `order_by` and `filter_mode` will affect connection identity and thus produce new connection records.
-   Conceptually, this means that we're specifying which arguments affect the output of the connection from the server, or in other words, which arguments are _actually_ **_filters_**. If one of the connection arguments doesn't actually change the set of items that are returned from the server, or their ordering, then it isn't really a filter on the connection, and we don't need to identify the connection differently when that value changes. In our example, changing the `language` of the comments we request doesn't change the set of comments that are returned by the connection, so it is safe to exclude it from `filters`.
-   This can also be useful if we know that any of the connection arguments will never change in our app, in which case it would also be safe to exclude from `filters`.

2) An easier API alternative to manage multiple connections with multiple filter values is still pending

<blockquote>
<strong>TODO</strong>
</blockquote>

### Advanced Pagination Use Cases

In this section we're going to cover how to implement more advanced pagination use cases than the default cases covered by `usePaginationFragment`.

#### Pagination Over Multiple Connections

If you need to paginate over multiple connections within the same component, you can use `usePaginationFragment` multiple times:

```javascript
import type {CombinedFriendsListComponent_user$key} from 'CombinedFriendsListComponent_user.graphql';
import type {CombinedFriendsListComponent_viewer$key} from 'CombinedFriendsListComponent_viewer.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  user: CombinedFriendsListComponent_user$key,
  viewer: CombinedFriendsListComponent_viewer$key,
|};

function CombinedFriendsListComponent(props: Props) {

  const {data: userData, ...userPagination} = usePaginationFragment(
    graphql`
      fragment CombinedFriendsListComponent_user on User {
        name
        friends
          @connection(
            key: "CombinedFriendsListComponent_user_friends_connection"
          ) {
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

  const {data: viewerData, ...viewerPagination} = usePaginationFragment(
    graphql`
      fragment CombinedFriendsListComponent_user on Viewer {
        actor {
          ... on User {
            name
            friends
              @connection(
                key: "CombinedFriendsListComponent_viewer_friends_connection"
              ) {
              edges {
                node {
                  name
                  age
                }
              }
            }
          }
        }
      }
    `,
    props.viewer,
  );

  return (...);
}
```

However, we recommend trying to keep a single connection per component, to keep the components easier to follow.

#### Bi-directional Pagination

In the [Pagination](#pagination) section we covered how to use `usePaginationFragment` to paginate in a single _"forward"_ direction. However, connections also allow paginating in the opposite _"backward"_ direction. The meaning of _"forward"_ and _"backward"_ directions will depend on how the items in the connection are sorted, for example  _"forward"_ could mean more recent, and _"backward"_ could mean less recent.

Regardless of the semantic meaning of the direction, Relay also provides the same APIs to paginate in the opposite direction using **`usePaginationFragment`**, as long  as the **`before`** and **`last`** connection arguments are also used along with `after` and `first`:

```javascript
import type {FriendsListComponent_user$key} from 'FriendsListComponent_user.graphql';

const React = require('React');
const {Suspense} = require('React');

const {graphql, usePaginationFragment} = require('react-relay/hooks');

type Props = {|
  userRef: FriendsListComponent_user$key,
|};

function FriendsListComponent(props: Props) {
  const {
    data,
    loadPrevious,
    hasPrevious,
    // ... forward pagination values
  } = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(after: $after, before: $before, first: $first, last: $last)
          @connection(key: "FriendsListComponent_user_friends_connection") {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    userRef,
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

      {hasPrevious ? (
        <Button onClick={() => loadPrevious(10)}>
          Load more friends
        </Button>
      ) : null}

    </>
    // Forward pagination controls can also be included
  );
}


```

-   The APIs for both _"forward"_ and _"backward"_ are exactly the same, they're only named differently. When paginating forward, then the  `after` and `first` connection arguments will be used, when paginating backward, the `before` and `last` connection arguments will be used.
-   Note that the primitives for both _"forward"_ and _"backward"_ pagination are exposed from a single use of `usePaginationFragment` call, so both _"forward"_ and _"backward"_ pagination can be performed simultaneously in the same component.

#### Custom Connection State

By default, when using `usePaginationFragment` and `@connection`, Relay will _append_ new pages of items to the connection when paginating _"forward",_ and _prepend_ new pages of items when paginating _"backward"_. This means that your component will always render the **_full_** connection, with _all_ of the items that have been accumulated so far via pagination, and/or items that have been added or removed via mutations or subscriptions.

However, it is possible that you'd need different behavior for how to merge and accumulate pagination results (or other updates to the connection), and/or derive local component state from changes to the connection. Some examples of this might be:

-   Keeping track of different _visible_ slices or windows of the connection.
-   Visually separating each _page_ of items. This requires knowledge of the exact set of items inside each page that has been fetched.
-   Displaying different ends of the same connection simultaneously, while keeping track of the "gaps" between them, and being able to merge results when preforming pagination between the gaps. For example, imagine rendering a list of comments where the oldest comments are displayed at the top, then a "gap" that can be interacted with to paginate, and then a section at the bottom which shows the most recent comments that have been added by the user or by real-time subscriptions.

To address these more complex use cases, Relay is still working on a solution:

<blockquote>
<strong>TODO</strong>
</blockquote>

#### Refreshing connections

<blockquote>
<strong>TODO</strong>
</blockquote>

#### Prefetching Pages of a Connection

<blockquote>
<strong>TODO</strong>
</blockquote>

#### Rendering One Page of Items at a Time

<blockquote>
<strong>TODO</strong>
</blockquote>

## Advanced Data Fetching

### Preloading Data

#### Preloading Data for Initial Load (Server Preloading)

<blockquote>
OSS TODO
</blockquote>

#### Preloading Data for Transitions, in Parallel With Code (Client Preloading)

The way navigations or transitions into different pages work by default is the following:

-   _first_, we load the code necessary to render that new page, since that will usually correspond to a separate JS bundle.
-   \*then, once the code for the new page is loaded, we can start rendering it, and only at that point when we start rendering the page do we send a network request to fetch the data that the page needs, for example by using `useLazyLoadQuery` ([Queries](#queries)).

This not only applies to transitions to other pages, but also for displaying elements such as dialogs, menus, popovers, or other elements that are hidden behind some user interaction, and which have both code _and_ data dependencies.

The problem with this naive approach is that we have to wait for a significant amount of time before we can actually start fetching the data we need. Ideally, by the time a user interaction occurs, we'd already know what data we will need in order to fulfill that interaction, and we could start _preloading_ it from the client immediately, **_in parallel_** with loading the JS code that we're going to need; by doing so, we can significantly speed up the amount of time it takes to show content to users after an interaction.

In order to do so, we can use **Relay EntryPoints**, which are a set of APIs for efficiently loading both the code and data dependencies of _any_ view in parallel. Check out our api reference for Entry Points: (TODO)

### Incremental Data Delivery

<blockquote>
OSS TODO
</blockquote>

### Data-driven Dependencies

<blockquote>
OSS TODO
</blockquote>

### Image Prefetching

The standard approach to loading images with Relay is to first request image URIs via a Relay fragment, then render an appropriate image component with the resulting URI as the source. With this approach the image is only downloaded if it is actually rendered, which is often a good tradeoff as it avoids fetching images that aren't used. However, there are some cases where a product knows statically that it will render an image, and in this case performance can be improved by downloading the image as early as possible. Relay **image prefetching** allows products to specify that specific image URLs be downloaded as early as possible - as soon as the GraphQL data is fetched - without waiting for the consuming component to actually render.

#### Usage

<blockquote>
OSS TODO
</blockquote>

#### When To Use Image Prefetching

We recommend only using preloading for images that will be unconditionally rendered to the DOM by your components soon after being fetched, and avoid prefetching images that are hidden behind an interaction.

## Updating Data

Relay holds a local in-memory store of normalized GraphQL data, which accumulates data as GraphQL queries are made throughout usage of our app; think of it as a local database of GraphQL data. When records are updated, any components affected by the updated data will be notified and re-rendered with the updated data.

In this section, we're going to go over how to update data in the server as well as how to update our local data store accordingly, ensuring that our components are kept in sync with the latest data.

### GraphQL Mutations

In GraphQL, data in the server is updated using [GraphQL Mutations](https://graphql.org/learn/queries/#mutations). Mutations are _read-write_ server operations, which both modify data in the backend, and allow querying for the modified data from the server in the same request.

A GraphQL mutation looks very similar to a query, with the exception that it uses the **`mutation`** keyword:

```graphql
mutation LikePostMutation($input: LikePostData!) {
  like_post(data: $input) {
    post {
      id
      viewer_does_like
      like_count
    }
  }
}
```

-   The mutation above modifies the server data to "like" the specified `Post` object. The **`like_post`** field is the mutation field itself, which takes specific input and will be processed by the server to update the relevant data in the backend.
-   **`like_post`** returns a specific GraphQL type which exposes the data we can query in the mutation response. In this case, we're querying for the **_updated_** post object, including the updated `like_count` and the updated value for `viewer_does_like`, indicating if the current viewer likes the post object.

An example of a successful response for the above mutation could look like this:

```json

{
  "like_post": {
    "post": {
      "id": "post-id",
      "viewer_does_like": true,
      "like_count": 1,
    }
  }
}
```

In Relay, we can declare GraphQL mutations using the `graphql` tag too:

```javascript
const {graphql} = require('react-relay');

const likeMutation = graphql`
  mutation LikePostMutation($input: LikePostData!) {
    like_post(data: $input) {
      post {
        id
        viewer_does_like
        like_count
      }
    }
  }
`;
```

-   Note that mutations can also reference GraphQL [Variables](#variables) in the same way queries or fragments do.

In order to _execute_ a mutation against the server in Relay, we can use the **`useMutation`** hook.

```javascript
import type {LikePostData, LikePostMutation} from 'LikePostMutation.graphql';

const {graphql, useMutation} = require('react-relay/hooks');

type Props = {|
  likePostData: LikePostData,
|};
function LikeButton(props: Props) {
  const [commit, isInFlight] = useMutation<LikePostMutation>(graphql`
    mutation LikePostMutation($input: LikePostData!)
      like_post(data: $input) {
        post {
          id
          viewer_does_like
          like_count
        }
      }
    }
  `);

  const mutationConfig = {
    variables: {
      input: props.likePostData,
    },
  };

  return (
    <Button disabled={isInFlight} onClick={() => commit(mutationConfig)}>
      Like
    </Button>
  );
}

module.exports = LikeButton;
```

Let's distill what's happening here:

-   `useMutation` takes a mutation `GraphQLTaggedNode` (the result of using the `graphql` template tag), and an optional `commitMutationFn`.
-   `useMutation` returns `[commit, isInFlight]: [(UseMutationConfig<TMutation>) => Disposable, boolean]`.
-   `isInFlight` will be true if any mutation triggered by calling `commit` is still in flight. If you call `commit` multiple times, there can be multiple mutations in flight at once.
-   `commit` is a function that accepts a `UseMutationConfig`. The type of `UseMutationConfig` is as follows:

```javascript
type UseMutationConfig<TMutation: MutationParameters> = {|
  configs?: Array<DeclarativeMutationConfig>,
  onError?: ?(error: Error) => void,
  onCompleted?: ?(
    response: $ElementType<TMutation, 'response'>,
    errors: ?Array<PayloadError>,
  ) => void,
  onUnsubscribe?: ?() => void,
  optimisticResponse?: $ElementType<
    {
      +rawResponse?: {...},
      ...TMutation,
      ...
    },
    'rawResponse',
  >,
  optimisticUpdater?: ?SelectorStoreUpdater,
  updater?: ?SelectorStoreUpdater,
  uploadables?: UploadableMap,
  variables: $ElementType<TMutation, 'variables'>,
|};
```

-   The only required property in the `UseMutationConfig` object is `variables`, which is an object containing the parameters to the mutation.
-   You can also include `onCompleted` and `onError` callbacks, which are called when the mutation completes or errors out, respectively.
-   Note that the input for the mutation can be Flow typed with the autogenerated type available from the `LikePostMutation.graphql` module. In general, the Relay will generate Flow types for mutations at build time, with the following naming format: `<mutation_name>.graphql.js`.
-   Note that `variables` and `response` in `onComplete` will be typed altogether by providing the autogenerated type `LikePostMutation` to `useMutation` from the `LikePostMutation.graphql` module.
-   When the mutation response is received, **_if the objects in the mutation response have IDs, the records in the local store will automatically be updated with the new field values from the response_**. In this case, it would automatically find the existing `Post` object matching the given ID in the store, and update the values for its `viewer_does_like` and `like_count` fields.
-   Note that any local data updates caused by the mutation will automatically cause components subscribed to the data to be notified of the change and re-render.
-   Calling `commit` results in a call to `commitMutation`, which you can learn about [here](https://relay.dev/docs/en/experimental/api-reference#commitMutation).

#### Updater functions

However, if the updates you wish to perform on the local data in response to the mutation are more complex than just updating the values of fields, like deleting or creating new records, or [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection), you can provide an **`updater`** function to `commit` for full control over how to update the store:

```javascript
import type {LikePostData, LikePostMutation} from 'LikePostMutation.graphql';

const {graphql, useMutation} = require('react-relay/hooks');

type Props = {|
  likePostData: LikePostData,
|};
function LikeButton(props: Props) {
  const [commit, isInFlight] = useMutation<LikePostMutation>(graphql`
    mutation LikePostMutation($input: LikePostData!) {
      like_post(data: $input) {
        post {
          id
          viewer_does_like
          like_count
        }
      }
    }
  `);

  const mutationConfig = {
    variables: {
      input: props.likePostData,
    },
    updater: store => {
      const postRecord = store.get(postID);

      // Get connection record
      const connectionRecord = ConnectionHandler.getConnection(
        postRecord,
        'CommentsComponent_comments_connection',
      );

      // Get the payload returned from the server
      const payload = store.getRootField('comment_create');

      // Get the edge inside the payload
      const serverEdge = payload.getLinkedRecord('comment_edge');

      // Build edge for adding to the connection
      const newEdge = ConnectionHandler.buildConnectionEdge(
        store,
        connectionRecord,
        serverEdge,
      );

      // Add edge to the end of the connection
      ConnectionHandler.insertEdgeAfter(
        connectionRecord,
        newEdge,
      );
    },
  };

  return (
    <Button disabled={isInFlight} onClick={() => commit(mutationConfig)}>
      Like
    </Button>
  );
}

module.exports = LikeButton;
```

Let's distill this example:

-   `updater` takes a _`store`_ argument, which is an instance of a `[RecordSourceSelectorProxy](https://relay.dev/docs/en/relay-store.html#recordsourceselectorproxy)`;  this interface allows you to _imperatively_ write and read data directly to and from the Relay store. This means that you have full control over how to update the store in response to the mutation response: you can _create entirely new records_, or _update or delete existing ones_. The full API for reading and writing to the Relay store is available here: https:
-   In our specific example, we're adding a new comment to our local store after it has successfully been added on the server. Specifically, we're adding a new item to a connection; for more details on the specifics of how that works, check out our [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection) section.
-   Note that the mutation response is a _root field_ record that can be read from the ``, specifically using the `` API. In our case, we're reading the `` root field, which is a root field in the mutation response.
-   Note that any local data updates caused by the mutation `` will automatically cause components subscribed to the data to be notified of the change and re-render.

#### Optimistic updates

Often times when executing a mutation we don't want to wait for the server response to complete before we respond to user interaction. For example, if a user clicks the "Like" button, we don't want to wait until the mutation response comes back before we show them that the post has been liked; ideally, we'd do that instantly.

More generally, in these cases we want to immediately update our local data _optimistically_, in order to improve perceived responsiveness; that is, we want to update our local data to immediately reflect what it would look like after the mutation _succeeds_. If the mutation ends up _not_ succeeding, we can roll back the change and show an error message, but we're _optimistically_ expecting the mutation to succeed most of the time.

In order to do this, Relay provides 2 APIs to specify an optimistic update when executing a mutation:

_**Optimistic Response**_

When you can predict what the server response for a mutation is going to be, the simplest way to optimistically update the store is by providing an **``** to ``:

```javascript


```

Let's see what's happening in this example.

-   The `` is an object matching the shape of the mutation response, and it simulates a successful response from the server. When ``, is provided, Relay will automatically process the response in the same way it would process the response from the server, and update the data accordingly (i.e. update the values of fields for the record with the matching id).
    -   In this case, we would immediately set the `` field to `` in our `` object, which would be immediately reflected in our UI.
-   If the mutation _succeeds_, **_the optimistic update will be rolled back,_** and the server response will be applied.
-   If the mutation _fails_, **_the optimistic update will be rolled back,_** and the error will be communicated via the `` callback.
-   Note that by adding `` directive,  the type for `` is generated , and the flow type is applied by: ``.

_**Optimistic Updater**_

However, in some cases we can't statically predict what the server response will be, or we need to optimistically perform more complex updates, like deleting or creating new records, or [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection). In these cases we can provide an **``** function to ``. For example, we can rewrite the above example using an `` instead of an ``:

```javascript


```

Let's see what's happening here:

-   The `` has the same signature and behaves the same way as the regular `` function, the main difference being that it will be executed immediately, before the mutation response completes.
-   If the mutation succeeds, **_the optimistic update will be rolled back,_** and the server response will be applied.
    -   Note that if we used an ``, we wouldn't be able to statically provide a value for ``, since it requires reading the current value from the store first, which we can do with an ``.
    -   Also note that when mutation completes, the value from the server might differ from the value we optimistically predicted locally. For example, if other "Likes" occurred at the same time, the final `` from the server might've incremented by more than 1.
-   If the mutation _fails_, **_the optimistic update will be rolled back,_** and the error will be communicated via the `` callback.
-   Note that we're not providing an `` function, which is okay. If it's not provided, the default behavior will still be applied when the server response arrives (i.e. merging the new field values for `` and `` on the `` object).


NOTE: Remember that any updates to local data caused by a mutation will automatically notify and re-render components subscribed to that data.


#### Order of Execution of Updater Functions

In general, execution of the `` and optimistic updates will occur in the following order:

-   If an `` is provided, Relay will use it to merge the new field values for the records that match the ids in the ``.
-   If `` is provided, Relay will execute it and update the store accordingly.
-   If the mutation request succeeds:
    -   Any optimistic update that was applied will be rolled back.
    -   Relay will use the server response to merge the new field values for the records that match the ids in the response.
    -   If an `` was provided, Relay will execute it and update the store accordingly. The server payload will be available to the `` as a root field in the store.
-   If the mutation request fails:
    -   Any optimistic update was applied will be rolled back.
    -   The `` callback will be called.

_**Full Example**_

This means that in more complicated scenarios you can still provide all 3 options: ``, `` and ``. For example, the mutation to add a new comment could be like something like the following (for full details on updating connections, check out our [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection) guide):

```javascript


```

Let's distill this example, according to the execution order of the updaters:

-   Given that an `` was provided, it will be executed _first_. This will cause the new value of `` to be merged into the existing `` object, setting it to ``.
-   Given that an `` was provided, it will be executed next. Our `` will create new comment and edge records from scratch, simulating what the new edge in the server response would look like, and then add the new edge to the connection.
-   When the optimistic updates conclude, components subscribed to this data will be notified.
-   When the mutation succeeds, all of our optimistic updates will be rolled back.
-   The server response will be processed by Relay, and this will cause the new value of `` to be merged into the existing `` object, setting it to ``.
-   Finally, the `` function we provided will be executed. The `` function is very similar to the `` function, however, instead of creating the new data from scratch, it reads it from the mutation payload and adds the new edge to the connection.

#### Invalidating Data during a Mutation

The recommended approach when executing a mutation is to request **_all_** the relevant data that was affected by the mutation back from the server (as part of the mutation body), so that our local Relay store is consistent with the state of the server.

However, often times it can be unfeasible to know and specify all the possible data that would be affected for mutations that have large rippling effects (e.g. imagine “blocking a user” or “leaving a group”).

For these types of mutations, it’s often more straightforward to explicitly mark some data as stale (or the whole store), so that Relay knows to refetch it the next time it is rendered. In order to do so, you can use the data invalidation apis documented in our [Staleness of Data section](#staleness-of-data).

#### Mutation Queueing


**TODO:** Left to be implemented in user space


### GraphQL Subscriptions

[GraphQL Subscriptions](https://graphql.org/blog/subscriptions-in-graphql-and-relay/) (GQLS) are a mechanism which allows clients to subscribe to changes in a piece of data from the server, and get notified whenever that data changes.

A GraphQL Subscription looks very similar to a query, with the exception that it uses the subscription keyword:

```graphql


```

-   Subscribing to the above subscription will notify the client whenever the specified `` object has been "liked" or "unliked". The **``** field is the subscription field itself, which takes specific input and will set up the subscription in the backend.
-   **``** returns a specific GraphQL type which exposes the data we can query in the subscription payload; that is, whenever the client is notified, it will receive the subscription payload in the notification. In this case, we're querying for the Post object with it's **_updated_** ``, which will allows us to show the like count in real time.

An example of a subscription payload received by the client could look like this:

```javascript


```

In Relay, we can declare GraphQL subcriptions using the `` tag too:

```javascript


```

-   Note that subscriptions can also reference GraphQL [Variables](#variables) in the same way queries or fragments do.

In order to _execute_ a subscription against the server in Relay, we can use the **``** hook:

```javascript


```

Let's distill what's happening here:

-   `` takes a config object containing the subscription and the variables that the GraphQL query expects.
-   Note that the `` for the subscription can be Flow typed with the autogenerated type available from the `` module. In general, the Relay will generate Flow types for subscriptions at build time, with the following naming format: ``.
-   `` also take `` and `` callbacks, which will be called respectively when the subscription is successfully established, or when an error occurs.
-   `` also takes an `` callback, which will be called whenever a subscription payload is received.
-   When the subscription payload is received, **_if the objects in the subscription payload have IDs, the records in the local store will _automatically_ be updated with the new field values from the payload._** In this case, it would automatically find the existing `` object matching the given ID in the store, and update the values for the `` field.
-   Note that any local data updates caused by the subscription will automatically cause components subscribed to the data to be notified of the change and re-render.

However, if the updates you wish to perform on the local data in response to the subscription are more complex than just updating the values of fields, like deleting or creating new records, or [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection), you can provide an `` function to **``** for full control over how to update the store:

```javascript


```

Let's distill this example:

-   `` takes a _``_ argument, which is an instance of a ``;  this interface allows you to _imperatively_ write and read data directly to and from the Relay store. This means that you have full control over how to update the store in response to the subscription payload: you can _create entirely new records_, or _update or delete existing ones_. The full API for reading and writing to the Relay store is available here:
-   In our specific example, we're adding a new comment to our local store when we receive a subscription payload notifying us that a new comment has been created. Specifically, we're adding a new item to a connection; for more details on the specifics of how that works, check out our [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection) section.
-   Note that the subscription payload is a _root field_ record that can be read from the ``, specifically using the `` API. In our case, we're reading the `` root field, which is a root field in the subscription response.
-   Note that any local data updates caused by the mutation `` will automatically cause components subscribed to the data to be notified of the change and re-render.

### Local Data Updates

There are a couple of APIs that Relay provides in order to make purely local updates to the Relay store (i.e. updates not tied to a server operation).

Note that local data updates can be made both on [client-only data](#client-only-data-client-schema-extensions), or on regular data that was fetched from the server via an operation.

#### commitLocalUpdate

To make updates using an `` function, you can use the **``** API:

```javascript


```

-   `` update simply takes an environment and an updater function.
    -   `` takes a _``_ argument, which is an instance of a ``;  this interface allows you to _imperatively_ write and read data directly to and from the Relay store. This means that you have full control over how to update the store: you can _create entirely new records_, or _update or delete existing ones_. The full API for reading and writing to the Relay store is available here:
-   In our specific example, we're adding a new comment to our local store when. Specifically, we're adding a new item to a connection; for more details on the specifics of how that works, check out our [Adding and Removing Items From a Connection](#adding-and-removing-items-from-a-connection) section.
-   Note that any local data updates will automatically cause components subscribed to the data to be notified of the change and re-render.

#### commitPayload

**``** takes an `` and the payload for the query, and writes it to the Relay Store. The payload will be resolved like a normal server response for a query.

```javascript


```

-   An `` can be created by using ``; it takes the query and the query variables.
-   The payload can be typed using the Flow type generated by adding  @raw_response_type to the query.
-   Note that any local data updates will automatically cause components subscribed to the data to be notified of the change and re-render.

### Client-Only Data (Client Schema Extensions)

Relay provides the ability to extend the GraphQL schema **_on the client_** (i.e. in the browser), via client schema extensions, in order to model data that only needs to be created, read and updated on the client. This can be useful to add small pieces of information to data that is fetched from the server, or to entirely model client-specific state to be stored and managed by Relay.

Client schema extensions allows you to modify existing types on the schema (e.g. by adding new fields to a type), or to create entirely new types that only exist in the client.

#### Adding a Client Schema file

To add a client schema, create a new `` file inside your src directory. The file can be named anything.

#### Extending Existing Types

In order to extend an existing type, add a `` file to the appropriate schema extension file:

```graphql


```

-   In this example, we're using the **``** keyword to extend an existing type, and we're adding a new field, `` to the existing `` type, which we will be able to [read](#reading-client-only-data) in our components, and [update](#updating-client-only-data) when necessary using normal Relay APIs; you might imagine that we might use this field to render a different visual treatment for a comment if it's new, and we might set it when creating a new comment.
-   Note that in order for Relay to pick up this extension, the file needs to be inside your src directory. The file can be named anything, e.g.: ``.

#### Adding New Types

You can define types using the same regular GraphQL syntax, by defining it inside your client schema file:

```graphql


```

-   In this contrived example, we're defining 2 new client-only types, and `` and a regular ``. Note that they can reference themselves as normal, and reference regular server defined types. Also note that we can extend server types and add fields that are of our client-only types.
-   As mentioned previously, we will be able  [read](#reading-client-only-data) and [update](#updating-client-only-data) this data normally via Relay APIs.

#### Reading Client-Only Data

We can read client-only data by selecting it inside [fragments](#fragments) or [queries](#queries) as normal:

```javascript


```

#### Updating Client-Only Data

In order to update client-only data, you can do so regularly inside [mutation](#graphql-mutations) or [subscription](#graphql-subscriptions) updaters, or by using our primitives for doing [local updates](#local-data-updates) to the store.

## Local Application State Management


**TODO**


Roughly, at a high level:

1.  Read data from Relay
2.  Keep your state in React, possibly derive it from Relay data
3.  Write data back to Relay via mutations or local update

## Accessing Data Outside React

This section covers less common use cases, which involve fetching and accessing data outside of our React APIs. Most of the time you will be directly using our React APIs, so you don't need to know this to start building with Relay. However, these APIs can be useful for more advanced use cases when you need more control over how data is fetched and managed, for example when writing pieces of infrastructure on top of Relay.

### Fetching Queries

If you want to fetch a query outside of React, you can use the **``** function, which returns an observable:

```javascript


```

-   `` will automatically save the fetched data to the in-memory Relay store, and notify any components subscribed to the relevant data.
-   `` will **_NOT_** retain the data for the query, meaning that it is not guaranteed that the data will remain saved in the Relay store at any point after the request completes. If you wish to make sure that the data is retained outside of the scope of the request, you need to call `` directly on the query to ensure it doesn't get deleted. See [Retaining Queries](#retaining-queries) for more details.
-   The data provided in the `` callback represents a snapshot of the query data read from the Relay store at the moment a payload was received from the server.
-   Note that we specify the `` Flow type; this ensures that the type of the data provided by the observable matches the shape of the query, and enforces that the `` passed as input to `` match the type of the variables expected by the query.

If desired, you can convert the request into a Promise using **``**:

```javascript


```

-   The returned Promise that resolves to the query data, read out from the store when the first network response is received from the server. If the request fails, the promise will reject
-   Note that we specify the `` Flow type; this ensures that the type of the data the promise will resolve to matches the shape of the query, and enforces that the `` passed as input to `` match the type of the variables expected by the query.


See also our API Reference for [fetchQuery](./api-reference#fetchquery).


### Prefetching Queries

This section covers prefetching queries from the client (if you're interested in preloading for initial load or transitions,  see our [Preloading Data](#preloading-data) section). Prefetching queries can be useful to anticipate user actions and increase the likelihood of data being immediately available when the user requests it.


**TODO**


### Subscribing to Queries


**TODO**


### Reading Queries from Local Cache


**TODO**


### Reading Fragments from Local Cache


**TODO**


### Retaining Queries

In order to manually retain a query so that the data it references isn't garbage collected by Relay, we can use the **``** method:

```javascript


```

-   **NOTE:** Relay automatically manages the query data retention based on any mounted query components that are rendering the data, so\* you usually should **_not_** need to call `` directly within product code. For any advanced or special use cases, query data retention should usually be handled within infra-level code, such as a Router.

## Testing

See this guide for [Testing Relay Components](https://relay.dev/docs/en/testing-relay-components), which also applies for any components built using Relay Hooks.
