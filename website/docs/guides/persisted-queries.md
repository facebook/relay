---
id: persisted-queries
title: Persisted Queries
slug: /guides/persisted-queries/
description: Relay guide to persisted queries
keywords:
- persisted
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

<FbInternalOnly>

> Persistence is handled by the `relay` command for you. You likely do not need to worry about the contents of this guide.

</FbInternalOnly>

The relay compiler supports persisted queries. This is useful because:

-   the client operation text becomes just an md5 hash which is usually shorter than the real
    query string. This saves upload bytes from the client to the server.

-   the server can now whitelist queries which improves security by restricting the operations
    that can be executed by a client.

<OssOnly>

## Usage on the client

### The `--persist-output` flag

In your `npm` script in `package.json`, run the relay compiler using the `--persist-output` flag:

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist-output ./path/to/persisted-queries.json"
}
```

The `--persist-output` flag does 2 things:

1.  It converts all query and mutation operation texts to md5 hashes.

    For example without `--persist-output`, a generated `ConcreteRequest` might look like below:

    ```javascript
    const node/*: ConcreteRequest*/ = (function(){
    //... excluded for brevity
    return {
      "kind": "Request",
      "operationKind": "query",
      "name": "TodoItemRefetchQuery",
      "id": null, // NOTE: id is null
      "text": "query TodoItemRefetchQuery(\n  $itemID: ID!\n) {\n  node(id: $itemID) {\n    ...TodoItem_item_2FOrhs\n  }\n}\n\nfragment TodoItem_item_2FOrhs on Todo {\n    text\n    isComplete\n}\n",
      //... excluded for brevity
    };
    })();

    ```

    With `--persist-output <path>` this becomes:

    ```javascript
    const node/*: ConcreteRequest*/ = (function(){
    //... excluded for brevity
    return {
      "kind": "Request",
      "operationKind": "query",
      "name": "TodoItemRefetchQuery",
      "id": "3be4abb81fa595e25eb725b2c6a87508", // NOTE: id is now an md5 hash of the query text
      "text": null, // NOTE: text is null now
      //... excluded for brevity
    };
    })();

    ```

2.  It generates a JSON file at the `<path>` you specify containing a mapping from query ids
    to the corresponding operation texts.

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist-output ./src/queryMaps/queryMap.json"
}
```

The example above writes the complete query map file to `./src/queryMaps/queryMap.json`. You need to ensure all the directories
leading to the `queryMap.json` file exist.

</OssOnly>

### Network layer changes

You'll need to modify your network layer fetch implementation to pass a doc_id parameter in the POST body instead of a query parameter:

```javascript
function fetchQuery(operation, variables,) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      doc_id: operation.id, // NOTE: pass md5 hash to the server
      // query: operation.text, // this is now obsolete because text is null
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}
```


## Executing Persisted Queries on the Server

<FbInternalOnly>

Your server should then look up the query referenced by `doc_id` when responding to this request.

</FbInternalOnly>

<OssOnly>

To execute client requests that send persisted queries instead of query text, your server will need to be able
to lookup the query text corresponding to each id. Typically this will involve saving the output of the `--persist-output <path>` JSON file to a database or some other storage mechanism, and retrieving the corresponding text for the ID specified by a client.

For universal applications where the client and server code are in one project, this is not an issue since you can place
the query map file in a common location accessible to both the client and the server.

### Compile time push

For applications where the client and server projects are separate, one option is to have an additional npm run script
to push the query map at compile time to a location accessible by your server:

```javascript
"scripts": {
  "push-queries": "node ./pushQueries.js",
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist-output <path> && npm run push-queries"
}
```

Some possibilities of what you can do in `./pushQueries.js`:

-   `git push` to your server repo

-   save the query maps to a database

### Run time push

A second more complex option is to push your query maps to the server at runtime, without the server knowing the query ids at the start.
The client optimistically sends a query id to the server, which does not have the query map. The server then in turn requests
for the full query text from the client so it can cache the query map for subsequent requests. This is a more complex approach
requiring the client and server to interact to exchange the query maps.

### Simple server example

Once your server has access to the query map, you can perform the mapping. The solution varies depending on the server and
database technologies you use, so we'll just cover the most common and basic example here.

If you use `express-graphql` and have access to the query map file, you can import the `--persist-output` JSON file directly and
perform the matching using the `matchQueryMiddleware` from [relay-compiler-plus](https://github.com/yusinto/relay-compiler-plus).

```javascript
import Express from 'express';
import expressGraphql from 'express-graphql';
import {matchQueryMiddleware} from 'relay-compiler-plus';
import queryMapJson from './path/to/persisted-queries.json';

const app = Express();

app.use('/graphql',
  matchQueryMiddleware(queryMapJson),
  expressGraphql({schema}));
```

## Using `--persist-output` and `--watch`

It is possible to continuously generate the query map files by using the `--persist-output` and `--watch` options simultaneously.
This only makes sense for universal applications i.e. if your client and server code are in a single project
and you run them both together on localhost during development. Furthermore, in order for the server to pick up changes
to the `queryMap.json`, you'll need to have server side hot-reloading set up. The details on how to set this up
is out of the scope of this document.

</OssOnly>

<DocsRating />
