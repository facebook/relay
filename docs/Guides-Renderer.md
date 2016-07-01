---
id: guides-renderer
layout: docs
category: Guides
permalink: docs/guides-renderer.html
next: guides-ready-state
---

So far, we've covered two pieces that each contribute to declaring data:

 - **Relay.Route** lets us declare query roots.
 - **Relay.Container** lets components declare fragments.

To use these pieces to construct a full-fledged GraphQL query that we can send to the server to fetch data, we need to use the **Relay.Renderer**.

## Component and Route

**Relay.Renderer** is a React component that, given a `Container` and a `route` or `queryConfig`, attempts to fulfill the data required in order to render an instance of `Container`.

The container created using `Relay.createContainer` must be supplied via the `Container` prop, and the query configuration that conforms to the shape of a `RelayQueryConfig` must be supplied via the `queryConfig` prop.

```
ReactDOM.render(
  <Relay.Renderer
    Container={ProfilePicture}
    queryConfig={profileRoute}
  />,
  component
);
```

When the **Relay.Renderer** above is rendered, Relay will construct a query and send it to the GraphQL server. As soon as all required data has been fetched, `ProfilePicture` will be rendered. Props with fragments will contain data that was fetched from the server.

If either `Container` or `queryConfig` ever changes, **Relay.Renderer** will immediately start attempting to fulfill the new data requirements.

**Relay.Renderer** renders the loading state whenever it cannot immediately fulfill data needed to render. This often happens on the initial render, but it can also happen if either `Container` or `queryConfig` changes.

By default, nothing is rendered while loading data for the initial render. If a previous set of `Container` and `queryConfig` were fulfilled and rendered, the default behavior is to continue rendering the previous view.

## render prop

We can change this behavior by supplying the `render` prop:

```
<Relay.Renderer
  Container={ProfilePicture}
  queryConfig={profileRoute}
  render={({props}) => {
      if (props) {
        return <ProfilePicture {...props} />;
      } else {
        return <div>Loading...</div>;
      }
  }}
/>
```

This snippet configures **Relay.Renderer** to render the "Loading..." text whenever it needs to fetch data.

The `render` callback is called with an object with the following properties:

```
render({
  props: ?{[propName: string]: mixed},
  done: boolean,
  error: ?Error,
  retry: ?Function,
  stale: boolean
}): ?React$Element
```

### props

```
props: ?{[propName: string]: mixed}
```

If present, sufficient data is ready to render the container. This object must be spread into the container using the spread attribute operator. If absent, there is insufficient data to render the container.

### done

```
done: boolean
```

Whether all data dependencies have been fulfilled. If `props` is present but `done` is false, then sufficient data is ready to render, but some data dependencies have not yet been fulfilled.

### error

```
error: ?Error
```

If present, an error occurred while fulfilling data dependencies. If `props` and `error` are both present, then sufficient data is ready to render, but an error occurred while fulfilling deferred dependencies.

### retry

```
retry: ?Function
```

A function that can be called to re-attempt to fulfill data dependencies. This property is only present if an `error` has occurred.

### stale

```
stale: boolean
```

True when `forceFetch` is enabled and `props` is present due to available client data. Once the forced server request completes, `stale` will return to false.

If a `render` callback is not supplied, the default behavior is to render the container if data is available, the existing view if one exists, or nothing.

A `render` callback can simulate the default behavior by returning `undefined` to continue rendering the last view rendered (e.g. when transitioning from one `queryConfig` to another). Notice that this is different from a `render` callback that returns `null`, which would render nothing whenever data is loading, even if there was a previous view rendered.

### Example

```{4-6}
// In this example, `ErrorComponent` and `LoadingComponent`
// simply display a static error message / loading indicator.
<Relay.Renderer
  Container={ProfilePicture}
  queryConfig={profileRoute}
  render={({done, error, props, retry, stale}) => {
        if (error) {
          return <ErrorComponent />;
        } else if (props) {
          return <ProfilePicture {...props} />;
        } else {
          return <LoadingComponent />;
        }
      }}
/>
```

### ref

References to elements rendered by the `render` callback can be obtained by using the React `ref` prop. For example:

```
<FooComponent {...props} ref={handleFooRef} />

function handleFooRef(component) {
  // Invoked when `<FooComponent>` is mounted or unmounted. When mounted,
  // `component` will be the component. When unmounted, `component` will
  // be null.
}
```

## Force Fetching

Like most of the Relay APIs, **Relay.Renderer** attempts to resolve data using the client store before sending a request to the server. If we instead wanted to force a server request even if data is available on the client, we could use the `forceFetch` boolean prop.

```{4}
<Relay.Renderer
  Container={ProfilePicture}
  queryConfig={profileRoute}
  forceFetch={true}
/>
```

When `forceFetch` is true, **Relay.Renderer** will always send a request to the server. However, if all the data required to render is also available on the client, `renderFetched` may still be called before the server request completes.

## Ready State Change

**Relay.Renderer** also supports the `onReadyStateChange` prop which lets us receive fine-grained events as they occur while fulfilling the data requirements.

Learn how to use `onReadyStateChange` in our next guide, [Ready State](guides-ready-state.html).
