## Relay Runtime

A set of Relay APIs responsible for data fetching, reading and normalization of
the GraphQL data.

Example:

```js
// @flow strict-local

import type {FetchFunction} from 'relay-runtime';

const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  fetchQuery,
  graphql,
} = require('relay-runtime');

const fetchFn: FetchFunction = function (request, variables) {
  return new Observable.create(source => {
    fetch('/my-graphql-api', {
      method: 'POST',
      body: JSON.stringify({
        text: request.text,
        variables,
      }),
    })
      .then(response => response.json())
      .then(data => source.next(data));
  });
};

const network = Network.create(fetchFn);
const store = new Store(new RecordSource());
const environment = new Environment({
  network,
  store,
});

fetchQuery(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 'my-node-id'},
).subscribe({
  error: error => {
    console.error(error);
  },
  next: data => {
    console.log(data);
  },
});
```

For complete API reference, visit https://relay.dev/.
