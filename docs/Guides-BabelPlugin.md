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

The easiest way to get started for now is with the [Relay Starter Kit](https://github.com/facebook/relay-starter-kit) - this includes an example schema file and configures the [`babel-relay-plugin`](https://www.npmjs.com/package/babel-relay-plugin) npm module to transpile queries.

## Advanced Usage

If you're not using the starter kit, you'll have to configure `babel` to use the `babel-relay-plugin`. The steps are as follows:

```javascript
// `babel-relay-plugin` returns a function for creating plugin instances
var getBabelRelayPlugin = require('babel-relay-plugin');

// load previously saved schema data (see "Schema JSON" below)
var schemaData = require('schema.json');

// create a plugin instance
var plugin = getBabelRelayPlugin(schemaData);

// compile code with babel using the plugin
return babel.transform(source, {
  plugins: [plugin],
});
```

## Schema JSON

The plugin needs to understand your schema - `schemaData` in the above snippet. There are two ways to get this information, depending on the GraphQL implementation.

### Using `graphql`

An example of how to load a `schema.js` file, run the introspection query to get schema information, and save it to a JSON file can be found in the [starter kit](https://github.com/relayjs/relay-starter-kit/blob/master/scripts/updateSchema.js).

### Using Other GraphQL Implementations

If you're using a different GraphQL server implementation, we recommend adapting the above example to load the schema from your GraphQL server (e.g. via an HTTP request) and then save the result as JSON.


## Additional Options

By default, `babel-relay-plugin` catches GraphQL validation errors and logs them without exiting. The compiled code will also throw the same errors at runtime, making it obvious that something went wrong whether you're looking at your terminal or browser console.

When compiling code for production deployment, the plugin can be configured to immediately throw upon encountering a validation problem:

```javascript
var plugin = getBabelRelayPlugin(schemaData, {
  abortOnError: true,
});
```
