---
id: persisted-queries
title: Persisted Queries
---

The relay compiler supports persisted queries which is useful because:

* the client operation text becomes just an md5 hash which is usually shorter than the real
query string. This saves upload bytes from the client to the server.

* the server can now whitelist queries which improves security by restricting the operations
that can be run from the client.

## Usage on the client

### The `--persist` flag
In your `npm` script in `package.json`, run the relay compiler using the `--persist` flag:

```js
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist"
}
```

The `--persist` flag does 3 things:

1. It converts all query and mutation operation texts to md5 hashes.

    For example without `--persist`, a generated `ConcreteRequest` might look like below:

    ```js
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

    With `--persist` this becomes:

    ```js
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

2. It generates a matching `.queryMap.json` file containing a map of the id and the operation text in the same `__generated__`
directory as the `.graphql.js` file. In the example above, the `__generated__` directory will have these files:

    * `./__generated__/TodoItemRefetchQuery.graphql.js`
    * `./__generated__/TodoItemRefetchQuery.queryMap.json`

    The `.queryMap.json` file looks something like this:

    ```json
    {
      "3be4abb81fa595e25eb725b2c6a87508": "query TodoItemRefetchQuery(\n  $itemID: ID!\n) {\n  node(id: $itemID) {\n    ...TodoItem_item_2FOrhs\n  }\n}\n\nfragment TodoItem_item_2FOrhs on Todo {\n    text\n    isComplete\n}\n"
    }
    ```

3. It also generates a complete query map file at `[your_src_dir]/complete.queryMap.json`. This file contains all the query ids
and their operation texts. You can specify a custom file path for this file by using the `--persist-output` option:

```js
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist --persist-output ./src/queryMaps/queryMap.desktop.queryMap.json"
}
```

The example above writes the complete query map file to `./src/queryMaps/queryMap.desktop.queryMap.json`. You need to ensure all the directories
leading to the `queryMap.json` file exist. Also note that the file extension has to be `.json`.

### Network layer changes
You'll need to modify your network layer fetch implementation to pass a documentId parameter in the POST body instead of a query parameter:

```js
function fetchQuery(operation, variables,) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      documentId: operation.id, // NOTE: pass md5 hash to the server
      // query: operation.text, // this is now obsolete because text is null
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}
```

## Usage on the server
On the server, you'll need to map the query id in the POST body to the real operation text. You can utilise the
`complete.queryMap.json` file to do this so you'll need a copy of it on your server.

For universal applications where the client and server code are in one project, this is not an issue since you can place
the query map file in a common location accessible to both the client and the server.

### Compile time push
For applications where the client and server projects are separate, one option is to have an additional npm run script
to push the query map at compile time to a location accessible by your server:

```js
"scripts": {
  "push-queries": "node ./pushQueries.js",
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist && npm run push-queries"
}
```

Some possibilities of what you can do in `./pushQueries.js`:

* `git push` to your server repo

* save the query maps to a database

### Run time push
A second more complex option is to push your query maps to the server at runtime, without the server knowing the query ids at the start.
The client optimistically sends a query id to the server, which does not have the query map. The server then in turn requests
for the full query text from the client so it can cache the query map for subsequent requests. This is a more complex approach
requiring the client and server to interact to exchange the query maps.

### Simple server example
Once your server has access to the query map, you can perform the mapping. The solution varies depending on the server and
database technologies you use, so we'll just cover the most common and basic example here.

If you use `express-graphql` and have access to the query map file, you can import the `complete.queryMap.json` file directly and
perform the matching using the `matchQueryMiddleware` from [relay-compiler-plus](https://github.com/yusinto/relay-compiler-plus).

```js
import Express from 'express';
import expressGraphql from 'express-graphql';
import {matchQueryMiddleware} from 'relay-compiler-plus';
import queryMapJson from './complete.queryMap.json';

const app = Express();

app.use('/graphql',
  matchQueryMiddleware(queryMapJson),
  expressGraphl({schema}));
```

## Using `--persist` and `--watch`
It is possible to continuously generate the query map files by using the `--persist` and `--watch` options simultaneously.
This only makes sense for universal applications i.e. if your client and server code are in a single project
and you run them both together on localhost during development. Furthermore, in order for the server to pick up changes
to the `queryMap.json`, you'll need to have server side hot-reloading set up. The details on how to set this up
is out of the scope of this document.

