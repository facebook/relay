---
id: classic-guides-root-container
title: Root Container
original_id: classic-guides-root-container
---
So far, we've covered two pieces that each contribute to declaring data:

-   **Relay.Route** lets us declare query roots.
-   **Relay.Container** lets components declare fragments.

To use these pieces to construct a full-fledged GraphQL query that we can send to the server to fetch data, we need to use the **Relay.RootContainer**.

## Component and Route

**Relay.RootContainer** is a React component that, given a `Component` and a `route`, attempts to fulfill the data required in order to render an instance of `Component`.

```

ReactDOM.render(
  <Relay.RootContainer
    Component={ProfilePicture}
    route={profileRoute}
  />,
  container
);
```

When the **Relay.RootContainer** above is rendered, Relay will construct a query and send it to the GraphQL server. As soon as all required data has been fetched, `ProfilePicture` will be rendered. Props with fragments will contain data that was fetched from the server.

If either `Component` or `route` ever changes, **Relay.RootContainer** will immediately start attempting to fulfill the new data requirements.

## Render Callbacks

**Relay.RootContainer** accepts three optional callbacks as props that give us more fine-grained control over the render behavior.

### `renderLoading`

**Relay.RootContainer** renders the loading state whenever it cannot immediately fulfill data needed to render. This often happens on the initial render, but it can also happen if either `Component` or `route` changes.

By default, nothing is rendered while loading data for the initial render. If a previous set of `Component` and `route` were fulfilled and rendered, the default behavior is to continue rendering the previous view.

We can change this behavior by supplying the `renderLoading` prop:

```{"{"}4-6{"}"}

<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  renderLoading={function() {
    return <div>Loading...</div>;
  }}
/>

```

This snippet configures **Relay.RootContainer** to render the "Loading..." text whenever it needs to fetch data.

A `renderLoading` callback can simulate the default behavior by returning `undefined`. Notice that this is different from a `renderLoading` callback that returns `null`, which would render nothing whenever data is loading, even if there was a previous view rendered.

### `renderFetched`

When all data necessary to render becomes available, **Relay.RootContainer** will render the supplied `Component` by default. However, we can change this behavior by supplying a callback to the `renderFetched` prop:

```{"{"}4-10{"}"}

<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  renderFetched={function(data) {
    return (
      <ScrollView>
        <ProfilePicture {...data} />
      </ScrollView>
    );
  }}
/>

```

This snippet configures **Relay.RootContainer** to render `ProfilePicture` within a `ScrollView` component as soon as data is ready.

The `renderFetched` callback is always called with a `data` argument, which is an object mapping from `propName` to query data. It is expected that the `renderFetched` callback renders the supplied `Component` with them (e.g. using the [JSX spread attributes feature](https://facebook.github.io/react/docs/jsx-spread.html)).

<blockquote>
Note

Even though we have access to the `data` object in `renderFetched`, the actual data is intentionally opaque. This prevents the `renderFetched` from creating an implicit dependency on the fragments declared by `Component`.

</blockquote>

### `renderFailure`

If an error occurs that prevents **Relay.RootContainer** from fetching the data required for rendering `Component`, nothing will be rendered by default. Error handling behavior can be configured by supplying a callback to the `renderFailure` prop:

```{"{"}4-11{"}"}

<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  renderFailure={function(error, retry) {
    return (
      <div>
        <p>{error.message}</p>
        <p><button onClick={retry}>Retry?</button></p>
      </div>
    );
  }}
/>

```

The `renderFailure` callback is called with two arguments: an `Error` object and a function to retry the request. If the error was the result of a server error communicated in the server's response, the response payload is available for inspection on `error.source`.

## Force Fetching

Like most of the Relay APIs, **Relay.RootContainer** attempts to resolve data using the client store before sending a request to the server. If we instead wanted to force a server request even if data is available on the client, we could use the `forceFetch` boolean prop.

```{"{"}4{"}"}

<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  forceFetch={true}
/>

```

When `forceFetch` is true, **Relay.RootContainer** will always send a request to the server. However, if all the data required to render is also available on the client, `renderFetched` may still be called before the server request completes.

```{"{"}5-6,9{"}"}

<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  forceFetch={true}
  renderFetched={function(data, readyState) {
    var isRefreshing = readyState.stale;
    return (
      <ScrollView>
        <Spinner style={{display: isRefreshing ? 'block' : 'none' }}
        <ProfilePicture {...data} />
      </ScrollView>
    );
  }}
/>

```

When `forceFetch` is true and `renderFetched` is called as a result of available client data, `renderFetched` is called with a second argument that has a `stale` boolean property. The `stale` property is true if `renderFetched` is called before the forced server request completes.

## Ready State Change

**Relay.RootContainer** also supports the `onReadyStateChange` prop which lets us receive fine-grained events as they occur while fulfilling the data requirements.

Learn how to use `onReadyStateChange` in our next guide, [Ready State](./classic-guides-ready-state).
