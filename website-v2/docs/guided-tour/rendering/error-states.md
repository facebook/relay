---
id: error-states
title: Error States with ErrorBoundaries
slug: /guided-tour/rendering/error-states/
---

import DocsRating from '../../../src/core/DocsRating';
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

In order to retry fetching a query after an error has occurred, we can attempt to re-mount the query component that produced an error:

```js
/**
 * ErrorBoundaryWithRetry.react.js
 */

const React = require('React');

type State = {error: ?Error};

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

```js
/**
 * App.react.js
 */

const ErrorBoundaryWithRetry = require('ErrorBoundaryWithRetry');
const React = require('React');

const MainContent = require('./MainContent.react');

function App() {
  return (
    <ErrorBoundaryWithRetry
      fallback={(error, retry) =>
        <>
          <ErrorUI error={error} />
          {/* Render a button to retry; this will attempt to re-render the
            content inside the boundary, i.e. the query component */}
          <Button onPress={retry}>Retry</Button>
        </>
      }>
      <MainContent />
    </ErrorBoundaryWithRetry>
  );
}
```

* The sample Error Boundary in this example code will provide a `retry` function to re-attempt to render the content that originally produced the error. By doing so, we will attempt to re-render our query component (that uses `usePreloadedQuery`), and consequently attempt to fetch the query again.



## Accessing errors in GraphQL Responses


By default, internally at fb, Relay will *only* surface errors to React that are returned in the top-level [`errors` field](https://graphql.org/learn/validation/) if they are ether:

* of `CRITICAL` severity,
*  *or* if the top-level `data` field wasn't returned in the response.


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
