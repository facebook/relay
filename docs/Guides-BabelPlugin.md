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

The easiest way to get started for now is with the [Relay Starter Kit](https://github.com/relayjs/relay-starter-kit) - this includes an example schema file and configures the [`babel-relay-plugin`](https://www.npmjs.com/package/babel-relay-plugin) npm module to transpile queries.

### React Native Configuration

The `babel-relay-plugin` must run before the `react-native` Babel preset. Thus, in `.babelrc`  `"react-native"` must come after `babelRelayPlugin`.

```javascript
{
  "passPerPreset": true,
  "plugins": [
    "./plugins/babelRelayPlugin"
  ],
  "presets": [
    "react-native"
  ]
}
```

The reasoning is that if `babel-relay-plugin` does not run before the `es2015-template-literals` transform, it will not transform the Relay.QL template literals correctly. Also in Babel 6, you can’t control plugin order. So in React Native, where plugins in `.babelrc` are loaded before the projects `.babelrc`, it’s impossible to use the Babel Relay Plugin without overriding the entire transform list.


## Advanced Usage

If you're not using the starter kit, you'll have to configure `babel` to use the `babel-relay-plugin`. The steps are as follows:

```javascript
// `babel-relay-plugin` returns a function for creating plugin instances
const getBabelRelayPlugin = require('babel-relay-plugin');

// load previously saved schema data (see "Schema JSON" below)
const schemaData = require('schema.json');

// create a plugin instance
const plugin = getBabelRelayPlugin(schemaData);

// compile code with babel using the plugin
return babel.transform(source, {
  plugins: [plugin],
});
```

## Schema JSON

The plugin needs to understand your schema - `schemaData` in the above snippet. There are two ways to get this information, depending on the GraphQL implementation.

### Using `graphql`

Use `introspectionQuery` to generate a Schema JSON for the Babel Relay Plugin, and use `printSchema` to generate a user readable type system shorthand:

```javascript
import fs from 'fs';
import path from 'path';
import {graphql}  from 'graphql';
import {introspectionQuery, printSchema} from 'graphql/utilities';

// Assume your schema is in ../data/schema
import {schema} from '../data/schema';
const yourSchemaPath = path.join(__dirname, '../data/schema');

// Save JSON of full schema introspection for Babel Relay Plugin to use
graphql(schema, introspectionQuery).then(result => {
  fs.writeFileSync(
    `${yourSchemaPath}.json`,
    JSON.stringify(result, null, 2)
  );
});

// Save user readable type system shorthand of schema
fs.writeFileSync(
  `${yourSchemaPath}.graphql`,
  printSchema(schema)
);
```

For a complete example of how to load a `schema.js` file, run the introspection query to get schema information, and save it to a JSON file, check out the [starter kit](https://github.com/relayjs/relay-starter-kit/blob/master/scripts/updateSchema.js).

### Using Other GraphQL Implementations

If you're using a different GraphQL server implementation, we recommend adapting the above example to load the schema from your GraphQL server (e.g. via an HTTP request) and then save the result as JSON.

An example using `fetch` looks like this:

```javascript
const fetch = require('node-fetch');
const fs = require('fs');
const {
  buildClientSchema,
  introspectionQuery,
  printSchema,
} = require('graphql/utilities');
const path = require('path');
const schemaPath = path.join(__dirname, 'schema');

const SERVER = 'http://example.com/graphql';

// Save JSON of full schema introspection for Babel Relay Plugin to use
fetch(SERVER, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({'query': introspectionQuery}),
}).then(res => res.json()).then(schemaJSON => {
  fs.writeFileSync(
    `${schemaPath}.json`,
    JSON.stringify(schemaJSON, null, 2)
  );

  // Save user readable type system shorthand of schema
  const graphQLSchema = buildClientSchema(schemaJSON.data);
  fs.writeFileSync(
    `${schemaPath}.graphql`,
    printSchema(graphQLSchema)
  );
});
```

## Additional Options

By default, `babel-relay-plugin` catches GraphQL validation errors and logs them without exiting. The compiled code will also throw the same errors at runtime, making it obvious that something went wrong whether you're looking at your terminal or browser console.

When compiling code for production deployment, the plugin can be configured to immediately throw upon encountering a validation problem. The plugin can be further customized for different environments with the following options:

```javascript
babel.transform(source, {
  plugins: [
    [getBabelRelayPlugin(schemaData, {
      // Only if `enforceSchema` is `false` and `debug` is `true`
      // will validation errors be logged at build time.
      debug: false,
      // Suppresses all warnings that would be printed.
      suppressWarnings: false,
      // Can add a custom validator.
      // Supplying one overrides the default one, skipping the default rules.
      validator: {
        validate(schema, ast) {
          // Return an array of `Error` instances.
          return [];
        },
      },
      // Will throw an error when it validates the queries at build time.
      enforceSchema: true,
    })],
  ],
});
```
