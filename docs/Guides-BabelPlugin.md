---
id: guides-babel-plugin
title: Babel Relay Plugin
layout: docs
category: Guides
permalink: docs/guides-babel-plugin.html
next: graphql-relay-specification
---

Relay uses a **babel** plugin to convert from `Relay.QL` string templates to
JavaScript code that describes each query and includes data from the GraphQL
schema.

While you type queries as follows:

```
Relay.QL`
  fragment on User {
    # ...
  }
`
```

This gets converted into an immediately-invoked function:

```
(function() {
  // Return a description of the query ...
})();
```

## Usage

The easiest way to get started for now is with the [Relay Starter Kit](https://github.com/facebook/relay-starter-kit) - this includes an example schema file and configures the `babel-relay-plugin` npm module to transpile queries. Going forward, we'll provide additional documentation and make it easier to work with this plugin. Expect more information soon.
