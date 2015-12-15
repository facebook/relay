---
id: api-reference-relay
title: Relay
layout: docs
category: API Reference
permalink: docs/api-reference-relay.html
next: api-reference-relay-container
---


`Relay` is the entry point to the Relay library. If you're using one of the prebuilt packages it's available as a global; if you're using CommonJS modules you can `require()` it.

> Note
>
> The `react-relay` npm module includes `react` as a *peer dependency*. Your app should specify React as a dependency explicitly.

The most-used function is [`createContainer()`](#createcontainer-static-method) which wraps components with data declarations.

## Overview

*Properties*

<ul class="apiIndex">
  <li>
    <a href="guides-network-layer.html">
      <pre>static DefaultNetworkLayer &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="guides-mutations.html">
      <pre>static Mutation &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="api-reference-relay-ql.html">
      <pre>static QL &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="api-reference-relay-proptypes.html">
      <pre>static PropTypes &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="guides-root-container.html">
      <pre>static RootContainer &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="guides-routes.html">
      <pre>static Route &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="api-reference-relay-store.html">
      <pre>static Store &rarr;</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#createcontainer-static-method">
      <pre>static createContainer(Component, ContainerConfig)</pre>
      Creates a Relay Container.
    </a>
  </li>
  <li>
    <a href="#injectnetworklayer-static-method">
      <pre>static injectNetworkLayer(networkLayer)</pre>
      Customize how queries and mutations are sent to the server.
    </a>
  </li>
  <li>
    <a href="#injecttaskscheduler-static-method">
      <pre>static injectTaskScheduler(scheduler)</pre>
      Configure when Relay processing occurs.
    </a>
  </li>
  <li>
    <a href="#iscontainer-static-method">
      <pre>static isContainer(Component)</pre>
      Determine if a given object is a Relay.Container.
    </a>
  </li>
</ul>

## Properties

### DefaultNetworkLayer (static property)

See the [Network Layer Guide](guides-network-layer.html).

### Mutation

See the [Mutations Guide](guides-mutations.html).

### QL

See the [Relay.QL API reference](api-reference-relay-ql.html).

### PropTypes

See the [PropTypes API reference](api-reference-relay-proptypes.html).

### RootContainer

See the [RootContainer Guide](guides-root-container.html).

### Route

See the [Routes Guide](guides-routes.html).

### Store

See the [Store API reference](api-reference-relay-store.html).

## Methods

### createContainer (static method)

```
var Container = Relay.createContainer(Component, {
  initialVariables?: Object,
  prepareVariables?: (variables: Object, route: string) => Object,
  fragments: {[key: string]: Function}
});
```

Creates a new Relay Container - see the [Container Guide](guides-containers.html) for more details and examples.

### injectNetworkLayer (static method)

```
Relay.injectNetworkLayer(networkLayer: {
  sendMutation: (mutation: RelayMutationRequest) => void;
  sendQueries: (queries: Array<RelayQueryRequest>) => void;
  supports: (...options: Array<string>): boolean;
});
```

Overrides the [DefaultNetworkLayer](#defaultnetworklayer-static-property).

#### Example

As an example, we can log each mutation that is sent to the server as follows:

```
var DefaultNetworkLayer = Relay.DefaultNetworkLayer;

class MutationLoggingNetworkLayer extends DefaultNetworkLayer {
  sendMutation(mutation) {
    // log the response or error (note that `mutation` is a promise)
    mutation.then(
      response => console.log(response),
      error => console.error(error),
    );
    // Send the mutation using the default network implementation
    return super.sendMutation(mutation);
  }
};

Relay.injectNetworkLayer(new MutationLoggingNetworkLayer());
```

### injectTaskScheduler (static method)

```
Relay.injectTaskScheduler(scheduler: Scheduler): void;

type Scheduler = (task: Function) => void;
```

Relay wraps its core processing functions inside lightweight tasks, which by default are executed immediately (i.e. synchronously). In order to customize *when* these tasks are run - for example to avoid interrupting an animation during a touch gesture - applications can provide a custom scheduling function.

#### Examples

The default implementation is as follows:

```
Relay.injectTaskScheduler(task => task());
```

Notice that it immediately executes the next task. Relay manages the order of tasks to ensure a proper order of operations - the scheduler can't skip or reorder tasks, only decide when to execute the next one.

In React Native, we can schedule Relay processing so as to avoid interrupting touch gestures as follows:

```
var {InteractionManager} = require('react-native');

Relay.injectTaskScheduler(InteractionManager.runAfterInteractions);
```

You can read more about `InteractionManager` on the [React Native API docs](http://facebook.github.io/react-native/docs/interactionmanager.html).

### isContainer (static method)

```
Relay.isContainer(Component: Object): boolean;
```

#### Example

```
var Component = require('...');

if (Relay.isContainer(Component)) {
  Component.getFragment('...');
}
```
