---
id: error-states
title: Error States with ErrorBoundaries
slug: /guided-tour/rendering/error-states/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbErrorBoundary from './fb/FbErrorBoundary.md';

<FbErrorBoundary />

As you may have noticed, we mentioned that using `usePreloadedQuery` will render data from a query that was (or is) being fetched from the server, but we didn't elaborate on how to render UI to show an error if an error occurred during fetch. We will cover that in this section.

We can use [Error Boundary](https://reactjs.org/docs/error-boundaries.html) components to catch errors that occur during render (due to a network error, or any kind of error), and render an alternative error UI when that occurs. The way it works is similar to how `Suspense` works, by wrapping a component tree in an error boundary, we can specify how we want to react when an error occurs, for example by rendering a fallback UI.

[Error boundaries](https://reactjs.org/docs/error-boundaries.html) are simply components that implement the static `getDerivedStateFromError` method:

```js
const React = require('React');

type State = {error: ?Error};

class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error): State {
    // Set some state derived from the caught error
    return {error: error};
  }
}
```

```js
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
    // MainContent or Secondary Content
    <ErrorBoundary fallback={error => <ErrorUI error={error} />}>
      <MainContent />
      <SecondaryContent />
    </ErrorBoundary>
  );
}
```

* We can use the Error Boundary to wrap subtrees and show a different UI when an error occurs within that subtree. When an error occurs, the specified `fallback` will be rendered instead of the content inside the boundary.
* Note that we can also control the granularity at which we render error UIs, by wrapping components at different levels with error boundaries. In this example, if any error occurs within `MainContent` or `SecondaryContent`, we will render an `ErrorSection` in place of the entire app content.



## Retrying after an Error

### When using `useQueryLoader` / `loadQuery`

When using `useQueryLoader`/`loadQuery` to fetch a query, in order to retry after an error has occurred, you can call `loadQuery` again and pass the *new* query reference to `usePreloadedQuery`:

```js
/**
 * ErrorBoundaryWithRetry.react.js
 */

const React = require('React');

// NOTE: This is NOT actual production code;
// it is only used to illustrate example
class ErrorBoundaryWithRetry extends React.Component<Props, State> {
  state = {error: null};

  static getDerivedStateFromError(error): State {
    return {error: error};
  }

  _retry = () => {
    // This ends up calling loadQuery again to get and render
    // a new query reference
    this.props.onRetry();
    this.setState({
      // Clear the error
      error: null,
    });
  }

  render() {
    const {children, fallback} = this.props;
    const {error} = this.state;
    if (error) {
      if (typeof fallback === 'function') {
        return fallback({error, retry: this._retry});
      }
      return fallback;
    }
    return children;
  }
}
```
* When an error occurs, we render the provided `fallback`.
* When `retry` is called, we will clear the error, and call `loadQuery` again. This will fetch the query again and provide us a new query reference, which we can then pass down to `usePreloadedQuery`.

```js
/**
 * App.react.js
 */

const ErrorBoundaryWithRetry = require('ErrorBoundaryWithRetry');
const React = require('React');

const MainContent = require('./MainContent.react');

const query = require('__generated__/MainContentQuery.graphql');

// NOTE: This is NOT actual production code;
// it is only used to illustrate example
function App(props) {
  // E.g., initialQueryRef provided by router
  const [queryRef, loadQuery] = useQueryLoader(query, props.initialQueryRef);

  return (
    <ErrorBoundaryWithRetry
      // On retry we call loadQuery again, which will update
      // the value of queryRef from useQueryLoader with a new
      // fresh query reference
      onRetry={() => loadQuery(/* ... */)}
      fallback={({error, retry}) =>
        <>
          <ErrorUI error={error} />
          {/* Render a button to retry; this will attempt to re-render the
          content inside the boundary, i.e. the query component */}
          <Button onPress={retry}>Retry</Button>
        </>
      }>
      {/* The value of queryRef will be updated after calling
      loadQuery again */}
      <MainContent queryRef={queryRef} />
    </ErrorBoundaryWithRetry>
  );
}

/**
 * MainContent.react.js
 */
function MainContent(props) {
  const data = usePreloadedQuery(
    graphql`...`,
    props.queryRef
  );

  return (/* ... */);
}
```
* The sample Error Boundary in this example code will provide a `retry` function to the `fallback` which we can use to clear the error, re-load the query, and re-render with a new query ref that we can pass to the component that uses `usePreloadedQuery`. That component will consume the new query ref and suspend if necessary on the new network request.


### When using `useLazyLoadQuery`

When using `useLazyLoadQuery` to fetch a query, in order to retry after an error has occurred, you can attempt to re-mount *and* re-evaluate the query component by passing it a new `fetchKey`:

```js
/**
 * ErrorBoundaryWithRetry.react.js
 */

const React = require('React');

// NOTE: This is NOT actual production code;
// it is only used to illustrate example
class ErrorBoundaryWithRetry extends React.Component<Props, State> {
  state = {error: null, fetchKey: 0};

  static getDerivedStateFromError(error): State {
    return {error: error, fetchKey: 0};
  }

  _retry = () => {
    this.setState(prev => ({
      // Clear the error
      error: null,
      // Increment and set a new fetchKey in order
      // to trigger a re-evaluation and refetching
      // of the query using useLazyLoadQuery
      fetchKey: prev.fetchKey + 1,
    }));
  }

  render() {
    const {children, fallback} = this.props;
    const {error, fetchKey} = this.state;
    if (error) {
      if (typeof fallback === 'function') {
        return fallback({error, retry: this._retry});
      }
      return fallback;
    }
    return children({fetchKey});
  }
}
```
* When an error occurs, we render the provided `fallback`.
* When `retry` is called, we will clear the error, and increment our `fetchKey` which we can then pass down to `useLazyLoadQuery`. This will make it so we re-render the component that uses `useLazyLoadQuery` with a new `fetchKey`, ensuring that the query is refetched upon the new call to `useLazyLoadQuery`.

```js
/**
 * App.react.js
 */

const ErrorBoundaryWithRetry = require('ErrorBoundaryWithRetry');
const React = require('React');

const MainContent = require('./MainContent.react');

// NOTE: This is NOT actual production code;
// it is only used to illustrate example
function App() {
  return (
    <ErrorBoundaryWithRetry
      fallback={({error, retry}) =>
        <>
          <ErrorUI error={error} />
          {/* Render a button to retry; this will attempt to re-render the
            content inside the boundary, i.e. the query component */}
          <Button onPress={retry}>Retry</Button>
        </>
      }>
      {({fetchKey}) => {
        // If we have retried, use the new `retryQueryRef` provided
        // by the Error Boundary
        return <MainContent fetchKey={fetchKey} />;
      }}
    </ErrorBoundaryWithRetry>
  );
}

/**
 * MainContent.react.js
 */
function MainContent(props) {
  const data = useLazyLoadQuery(
    graphql`...`,
    variables,
    {fetchKey: props.fetchKey}
  );

  return (/* ... */);
}
```
* The sample Error Boundary in this example code will provide a `retry` function to the `fallback` which we can use to clear the error and re-render `useLazyLoadQuery` with a new `fetchKey`. This will cause the query to be re-evaluated and refetched, and `useLazyLoadQuery` start a new network request and suspend.



## Accessing errors in GraphQL Responses


<FbInternalOnly>

By default, internally at fb, Relay will *only* surface errors to React that are returned in the top-level [`errors` field](https://graphql.org/learn/validation/) if they are ether:

* of `CRITICAL` severity,
*  *or* if the top-level `data` field wasn't returned in the response.

</FbInternalOnly>


If you wish to access error information in your application to display user friendly messages, the recommended approach is to model and expose the error information as part of your GraphQL schema.

For example, you could expose a field in your schema that returns either the expected result, or an Error object if an error occurred while resolving that field (instead of returning null):


```js
type Error {
  # User friendly message
  message: String!
}

type Foo {
  bar: Result | Error
}
```




<DocsRating />
