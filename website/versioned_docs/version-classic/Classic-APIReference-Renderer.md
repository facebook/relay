---
id: classic-api-reference-relay-renderer
title: Relay.Renderer
original_id: classic-api-reference-relay-renderer
---
**Relay.Renderer** is a replacement for `Relay.RootContainer` that composes a `Relay.ReadyStateRenderer` and performs data fetching for a given `queryConfig`.

## Overview

_Props_

<ul className="apiIndex">
  <li>
    <a href="#container">
      <pre>Container</pre>
      Relay container that defines fragments and the view to render.
    </a>
  </li>
  <li>
    <a href="#forcefetch">
      <pre>forceFetch</pre>
      Whether to send a server request regardless of data available on the client.
    </a>
  </li>
  <li>
    <a href="#queryconfig">
      <pre>queryConfig</pre>
       `QueryConfig` or `Relay.Route` that defines the query roots.
    </a>
  </li>
  <li>
    <a href="#environment">
      <pre>environment</pre>
      An instance of `Relay.Environment` or any object that implements the `RelayEnvironment` interface.
    </a>
  </li>
    <li>
    <a href="#render">
      <pre>render</pre>
      Called to render when data requirements are being fulfilled.
    </a>
  </li>
  <li>
    <a href="#onreadystatechange">
      <pre>onReadyStateChange</pre>
    </a>
  </li>
</ul>

## Props

### Container

```

Container: RelayContainer

```

Must be a valid `RelayContainer`. Relay will attempt to fulfill its data requirements before rendering it.

### forceFetch

```

forceFetch: boolean

```

If supplied and set to true, a request for data will always be made to the server regardless of whether data on the client is available already.

### QueryConfig

```

queryConfig: RelayRoute

```

Either an instance of `Relay.Route` or an object with the `name`, `queries`, and optionally the `params` properties.

### Environment

```

environment: RelayEnvironment

```

An object that conforms to the `Relay.Environment` interface, such as `Relay.Store`.

### render

```

render({
  props: ?{[propName: string]: mixed},
  done: boolean,
  error: ?Error,
  retry: ?Function,
  stale: boolean
}): ?React$Element

```

If the render callback is not supplied, the default behavior is to render the container if data is available, the existing view if one exists, or nothing.

If the callback returns `undefined`, the previously rendered view (or nothing if there is no previous view) is rendered (e.g. when transitioning from one `queryConfig` to another).

#### Example

```{"{"}4-6{"}"}

// In this example, `ErrorComponent` and `LoadingComponent`
// simply display a static error message / loading indicator.
<Relay.Renderer
  Container={ProfilePicture}
  queryConfig={profileRoute}
  environment={Relay.Store}
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

### onReadyStateChange

```

onReadyStateChange(
  readyState: {
    aborted: boolean;
    done: boolean;
    error: ?Error;
    events: Array<ReadyStateEvent>;
    ready: boolean;
    stale: boolean;
  }
): void

```

This callback prop is called as the various events of data resolution occur.

See also: [Ready State](./classic-guides-ready-state)
