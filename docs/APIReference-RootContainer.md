---
id: api-reference-relay-root-container
title: Relay.RootContainer
layout: docs
category: API Reference
permalink: docs/api-reference-relay-root-container.html
next: api-reference-relay-ql
---

**Relay.RootContainer** is a React component that attempts to fulfill the data required in order to render an instance of `Component` for a given `route`.

## Overview

*Props*

<ul class="apiIndex">
  <li>
    <a href="#component">
      <pre>Component</pre>
      Relay container that defines fragments and the view to render.
    </a>
  </li>
  <li>
    <a href="#route">
      <pre>route</pre>
      Route that defines the query roots.
    </a>
  </li>
  <li>
    <a href="#forcefetch">
      <pre>forceFetch</pre>
      Whether to send a server request regardless of data available on the client.
    </a>
  </li>
  <li>
    <a href="#renderloading">
      <pre>renderLoading</pre>
      Called to render when data requirements are being fulfilled.
    </a>
  </li>
  <li>
    <a href="#renderfetched">
      <pre>renderFetched</pre>
      Called to render when data requirements are fulfilled.
    </a>
  </li>
  <li>
    <a href="#renderfailure">
      <pre>renderFailure</pre>
      Called to render when data failed to be fulfilled.
    </a>
  </li>
  <li>
    <a href="#onreadystatechange">
      <pre>onReadyStateChange</pre>
    </a>
  </li>
</ul>

## Props

### Component

```
Component: RelayContainer
```

Must be a valid `RelayContainer`. Relay will attempt to fulfill its data requirements before rendering it.

See also: [Root Container > Component and Route](guides-root-container.html#component-and-route)

### route

```
route: RelayRoute
```

Either an instance of `Relay.Route` or an object with the `name`, `queries`, and optionally the `params` properties.

See also: [Root Container > Component and Route](guides-root-container.html#component-and-route)

### forceFetch

```
forceFetch: boolean
```

If supplied and set to true, a request for data will always be made to the server regardless of whether data on the client is available to immediately fulfill the data requirements.

See also: [Root Container > Force Fetching](guides-root-container.html#force-fetching)

### renderLoading

```
renderLoading(): ?ReactElement
```

When data requirements have yet to be fulfilled, `renderLoading` is called to render the view. If this returns `undefined`, the previously rendered view (or nothing if there is no previous view) is rendered.

#### Example

```{4-6}
<Relay.RootContainer
  Component={ProfilePicture}
  route={profileRoute}
  renderLoading={function() {
    return <div>Loading...</div>;
  }}
/>
```

See also: [Root Container > renderLoading](guides-root-container.html#renderloading)

### renderFetched

```
renderFetched(
  data: {[propName: string]: $RelayData},
  readyState: {stale: boolean}
): ?ReactElement
```

When all data requirements are fulfilled, `renderFetched` is called to render the view. This callback is expected to spread `data` into the supplied `Container` when rendering it.

#### Example

```{4-10}
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

See also: [Root Container > renderFetched](guides-root-container.html#renderfetched)

### renderFailure

```
renderFailure(error: Error, retry: Function): ?ReactElement
```

When data requirements failed to be fulfilled, `renderFailure` is called to render the view.

#### Example

```{4-11}
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

See also: [Root Container > renderFailure](guides-root-container.html#renderfailure)

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
