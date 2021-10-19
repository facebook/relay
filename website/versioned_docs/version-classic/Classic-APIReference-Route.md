---
id: classic-api-reference-relay-route
title: Relay.Route
original_id: classic-api-reference-relay-route
---
Relay uses routes to define entry points into a Relay application.

<blockquote>
Note

Relay routes don't really implement any URL routing specific logic or work with History API. In the future we will maybe rename RelayRoute to be something more like RelayQueryRoots or RelayQueryConfig.

</blockquote>

## Overview

_Properties_

<ul className="apiIndex">
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

_Methods_

<ul className="apiIndex">
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

Routes can declare a set of parameter names that are required to be supplied to the constructor. This is also a convenient place to document the set of valid parameters.

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

Routes can use `prepareParams` to provide default parameters, or pass through, convert or suppress passed-in parameters.

#### Example

```

class ProfileRoute extends Relay.Route {
  static queries = {
    viewer: () => Relay.QL`query { viewer }`
  };
  static prepareParams = (prevParams) => {
    return {
      // Pass base set of supplied params through:
      ...prevParams,
      // Transform a param to meet internal requirements:
      id: toGlobalId('Profile', prevParams.id),
      // Provide a starting `limit` variable:
      limit: 10,
    }
  }
  // ...
}
```

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

In this example the Route should be initialized with a `userID` which gets passed on to the query. That `userID` variable will automatically be passed down to the top-level container and can be used there if needed. Further the top-level RelayContainer is expected to have a `user` fragment with the fields to be queried.

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
