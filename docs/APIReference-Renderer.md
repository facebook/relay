---
id: api-reference-relay-renderer
title: Relay.Renderer
layout: docs
category: API Reference
permalink: docs/api-reference-relay-renderer.html
next: api-reference-relay-ql
---

**Relay.Renderer** is a replacement for `Relay.RootContainer` that composes a `Relay.ReadyStateRenderer` and performs data fetching for a given `queryConfig`. 

## Overview

*Props*

<ul class="apiIndex">
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
    <a href="#onforcefetch">
      <pre>onForceFetch</pre>
      Called whenever forceFetch is being called
    </a>
  </li>
  <li>
    <a href="#onprimecache">
      <pre>onPrimeCache</pre>
      Called whenever primeCache is being called
    </a>
  </li>
  <li>
    <a href="#queryconfig">
      <pre>queryConfig</pre>
       QueryConfig or Route that defines the query roots.
    </a>
  </li>
  <li>
    <a href="#environment">
      <pre>environment</pre>
      The API for Relay core that provides methods for fetching/mutating data, an in-memory cache, etc.
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

If supplied and set to true, a request for data will always be made to the server regardless of whether data on the client is available to immediately fulfill the data requirements.


### onForceFetch

```
onForceFetch(
  querySet: RelayQuerySet,
  callback: (readyState: ReadyState) => void
): Abortable
```

This callback prop is called whenever a forceFetch occurs.


### onPrimeCache

```
onPrimeCache(
  querySet: RelayQuerySet,
  callback: (readyState: ReadyState) => void
): Abortable
```

This callback prop is called whenever a primeCache call occurs.

### QueryConfig

```
queryConfig: RelayRoute
```

Either an instance of `Relay.Route` or an object with the `name`, `queries`, and optionally the `params` properties.


### Environment

```
environment: RelayEnvironment
```

Either `Relay.Store`, an instance of `Relay.Evironment` or an object with the `forceFetch`, `getFragmentResolver`, `getStoreData`, `primeCache`, and `read` function defined.


### render

```
render(
  props: ?{[propName: string]: mixed},
  done: boolean,
  error: ?Error,
  retry: ?Function,
  stale: boolean
): ?RelayRenderCallback
```

Whenever anything is rendered `render` is called to render the view. If the callback is not supplied, the default behavior is to render the container if data is available, the existing view if one exists, or nothing.

If the callback returns `undefined`, the previously rendered view (or nothing if there is no previous view) is rendered (e.g. when transitioning from one `queryConfig` to another).

#### Example

```{4-6}
// This is the render function that `RelayRootContainer` defines with `renderFailure, renderFetched, Component, renderLoading` being passed in as props.
<RelayRenderer
  Container={ProfilePicture}
  route={profileRoute}
  render={({done, error, props, retry, stale}) => {
        if (error) {
          if (renderFailure) {
            return renderFailure(error, retry);
          }
        } else if (props) {
          if (renderFetched) {
            return renderFetched(props, {done, stale});
          } else {
            return <Component {...props} />;
          }
        } else {
          if (renderLoading) {
            return renderLoading();
          }
        }
        return undefined;
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
    ready: boolean;
    stale: boolean;
  }
): void
```

This callback prop is called as the various events of data resolution occurs.

See also: [Ready State](guides-ready-state.html)
