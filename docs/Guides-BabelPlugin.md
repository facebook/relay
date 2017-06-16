---
id: guides-babel-plugin
title: Babel Relay Plugin
layout: docs
category: Relay Classic Guides
permalink: docs/guides-babel-plugin.html
next: graphql-relay-specification
---

*`babel-relay-plugin` is deprecated. Use [`babel-plugin-relay`](./babel-plugin-relay.html#using-with-relay-classic) with Relay Classic.*

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

The `babel-relay-plugin` must run before the `react-native` Babel preset. Thus, in `.babelrc` `"react-native"` must come after `babelRelayPlugin`.

```javascript
{
  "plugins": [
    "relay"
  ],
  "presets": [
    "react-native"
  ]
}
```

The reasoning is that if `babel-plugin-relay` does not run before the `es2015-template-literals` transform, it will not transform the Relay.QL template literals correctly. Also in Babel 6, you can’t control plugin order. So in React Native, where plugins in `.babelrc` are loaded before the projects `.babelrc`, it’s impossible to use the Babel Relay Plugin without overriding the entire transform list.

## Schema JSON

The plugin needs to understand your schema - `schemaData` in the above snippet. There are two ways to get this information, depending on the GraphQL implementation.

### Using `graphql`

Use `introspectionQuery` to generate a Schema JSON for the Babel Relay Plugin, and use `printSchema` to generate a user readable type system shorthand:

```javascript
import fs from 'fs';
import path from 'path';
import {graphql}  from 'graphql';
import {introspectionQuery, printSchema} from 'graphql';

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
