---
id: classic-api-reference-relay
title: Relay
original_id: classic-api-reference-relay
---
`Relay` is the entry point to the Relay library. If you're using one of the prebuilt packages it's available as a global; if you're using CommonJS modules you can `require()` it.

<blockquote>
Note

The <code>react-relay</code> npm module includes <code>react</code> as a _peer dependency_. Your app should specify React as a dependency explicitly.

</blockquote>

The most-used function is [`createContainer()`](#createcontainer-static-method) which wraps components with data declarations.

## Overview

_Properties_

<ul className="apiIndex">
  <li>
    <a href="classic-guides-network-layer">
      <pre>static DefaultNetworkLayer →</pre>
    </a>
  </li>
  <li>
    <a href="classic-guides-mutations">
      <pre>static Mutation →</pre>
    </a>
  </li>
  <li>
    <a href="classic-api-reference-relay-ql">
      <pre>static QL →</pre>
    </a>
  </li>
  <li>
    <a href="classic-api-reference-relay-proptypes">
      <pre>static PropTypes →</pre>
    </a>
  </li>
  <li>
    <a href="classic-guides-root-container">
      <pre>static RootContainer →</pre>
    </a>
  </li>
  <li>
    <a href="classic-guides-routes">
      <pre>static Route →</pre>
    </a>
  </li>
  <li>
    <a href="classic-api-reference-relay-store">
      <pre>static Store →</pre>
    </a>
  </li>
</ul>

_Methods_

<ul className="apiIndex">
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

See the [Network Layer Guide](./classic-guides-network-layer).

### Mutation

See the [Mutations Guide](./classic-guides-mutations).

### QL

See the [Relay.QL API reference](./classic-api-reference-relay-ql).

### PropTypes

See the [PropTypes API reference](./classic-api-reference-relay-proptypes).

### RootContainer

See the [RootContainer Guide](./classic-guides-root-container).

### Route

See the [Routes Guide](./classic-guides-routes).

### Store

See the [Store API reference](./classic-api-reference-relay-store).

## Methods

### createContainer (static method)

```

var Container = Relay.createContainer(Component, {
  initialVariables?: Object,
  prepareVariables?: (variables: Object, route: string) => Object,
  fragments: {[key: string]: Function}
});
```

Creates a new Relay Container - see the [Container Guide](./classic-guides-containers) for more details and examples.

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

Relay wraps its core processing functions inside lightweight tasks, which by default are executed immediately (i.e. synchronously). In order to customize _when_ these tasks are run - for example to avoid interrupting an animation during a touch gesture - applications can provide a custom scheduling function.

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

You can read more about `InteractionManager` on the [React Native API docs](https://reactnative.dev/docs/interactionmanager.html).

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
