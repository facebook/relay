---
id: migration-setup
title: Migration Setup
---

## Installation

Follow the installation instructions from the [Installation and Setup](./installation-and-setup) guide.

## Set up babel-plugin-relay for Relay Classic

With some additional configuration, the `"relay"` babel plugin can also translate
Relay Classic `Relay.QL` literals. Most importantly, include a reference to your GraphQL Schema as either a json file or graphql schema file.

```javascript
{
  "plugins": [
    ["relay", {"schema": "path/schema.graphql"}]
  ]
}
```

## Set up babel-plugin-relay for "[compatibility mode](./relay-compat.html)"

When incrementally converting a Relay Classic app to Relay Modern, `graphql`
literals can be translated to be usable by *both* runtimes if configured to use
compatibility mode:

```javascript
{
  "plugins": [
    ["relay", {"compat": true, "schema": "path/schema.graphql"}]
  ]
}
```

## Additional Options

The Relay Classic and Relay Compat modes produce generated content inline and may
catch and log any detected GraphQL validation errors, leaving those errors to be
thrown at runtime.

When compiling code for production deployment, the plugin can be configured to immediately throw upon encountering a validation problem. The plugin can be further customized for different environments with the following options:

```javascript
{
  "plugins": [
    ["relay", {
      "compat": true,
      "schema": "path/schema.graphql",
    }]
  ]
}
```
