---
id: api-reference-relay-route
title: Relay.Route
layout: docs
category: API Reference
permalink: docs/api-reference-relay-route.html
next: api-reference-relay-renderer
---

Relay uses routes to define entry points into a Relay application.

> Note
>
> Relay routes don't really implement any URL routing specific logic or work with History API. In the future we will maybe rename RelayRoute to be something more like RelayQueryRoots or RelayQueryConfig.


## Overview

*Properties*

<ul class="apiIndex">
  <li>
    <a href="#paramdefinitions-static-property">
      <pre>static paramDefinitions</pre>
      Declare the expected parameters.
    </a>
  </li>
  <li>
    <a href="#prepareparams-static-property">
      <pre>static prepareParams</pre>
      Declare additional parameters or conversion for parameters.
    </a>
  </li>
  <li>
    <a href="#queries-static-property">
      <pre>static queries</pre>
      Declare the set of query roots.
    </a>
  </li>
  <li>
    <a href="#routename-static-property">
      <pre>static routeName</pre>
      Declare the name of this route class.
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#constructor">
      <pre>constructor(initialParams)</pre>
    </a>
  </li>
</ul>

## Properties

### paramDefinitions (static property)

```
static paramDefinitions: {[param: string]: {required: boolean}}
```

Routes can declare a set of parameter names that it requires to be supplied to the constructor. This is also a convenient place to document the set of valid parameters.

#### Example

```
class ProfileRoute extends Relay.Route {
  static paramDefinitions = {
    userID: {required: true},
  };
  // ...
}
```

### prepareParams (static property)

```
static prepareParams: ?(prevParams: {[prevParam: string]: mixed}) => {[param: string]: mixed};
```

Routes can declare additional parameters, or conversion for parameters on initialisation. These can also be used as query parameters in your nested containers.

#### Example

```
class ProfileRoute extends Relay.Route {
  static queries = {
    viewer: () => Relay.QL`query { viewer }`
  };
  static prepareParams = (prevParams) => {
    return {
      // Ensure any params that ProfileRoute gets initialised with will still be passed down.
      ...prevParams,
      //  Override the `limit` variable in the top level container.
      limit: 10
    }
  }
  // ...
}

const Container = Relay.createContainer(({viewer}) => (
  <View>
    {viewer.edges.map((edge) => <div>edge.node.name</div>)}
  </View>
  ), {
  initialVariables: {
    limit: null
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        friends(first: $limit) {
          edges {
            node {
              name
            }
          }
        }
      }
    `
  }
});
```
In this example `prepareParams` overrides any `limit` variables the route gets initialised with. Given `ProfileRoute` and `Container` are both being passed into `Relay.Renderer`, that limit variable will automatically be passed down to `Container`.

### queries (static property)

```
static queries: {
  [queryName: string]: () => Relay.QL`query { ... }`
};
```

Routes must declare a set of query roots using `Relay.QL`. These queries will automatically compose a matching fragment named `queryName` on
the Relay container used with this route on a **Relay.RootContainer**.

#### Example

```
class ProfileRoute extends Relay.Route {
  static queries = {
    user: () => Relay.QL`query { user(id: $userID) }`,
  };
  // ...
}
```
In this example the Route should be initialised with an `userID` which gets passed on to the query. That `userID` variable will automatically be passed down to the top-level container and can be used there if needed. Further the top-level RelayContainer is expected to have a `user` fragment with the fields to be queried.

### routeName (static property)

```
static routeName: string
```

Routes must define a string name.

## Methods

### constructor

Create a route instance using the `new` keyword, optionally passing it some params.

#### Example

```
var profileRoute = new ProfileRoute({userID: '123'});
```
