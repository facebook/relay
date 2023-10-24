---
id: relay-environment-provider
title: RelayEnvironmentProvider
slug: /api-reference/relay-environment-provider/
description: API reference for RelayEnvironmentProvider, which sets a Relay environment in React context
keywords:
  - environment
  - context
---

import DocsRating from '@site/src/core/DocsRating';

## `RelayEnvironmentProvider`

This component is used to set a Relay environment in React Context. Usually, a *single* instance of this component should be rendered at the very root of the application, in order to set the Relay environment for the whole application:

```js
const React = require('React');
const {
  Store,
  RecordSource,
  Environment,
  Network,
  Observable,
} = require("relay-runtime");

const {RelayEnvironmentProvider} = require('react-relay');

/**
 * Custom fetch function to handle GraphQL requests for a Relay environment.
 *
 * This function is responsible for sending GraphQL requests over the network and returning
 * the response data. It can be customized to integrate with different network libraries or
 * to add authentication headers as needed.
 *
 * @param {RequestParameters} params - The GraphQL request parameters to send to the server.
 * @param {Variables} variables - Variables used in the GraphQL query.
 */
function fetchFunction(params, variables) {
  const response = fetch("http://my-graphql/api", {
    method: "POST",
    headers: [["Content-Type", "application/json"]],
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  return Observable.from(response.then((data) => data.json()));
};

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
function createEnvironment() {
  const network = Network.create(fetchFunction);
  const store = new Store(new RecordSource());
  return new Environment({ store, network });
}

const environment = createEnvironment();

function Root() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  );
}

module.exports = Root;
```

### Props

* `environment`: The Relay environment to set in React Context. Any Relay Hooks (like [`useLazyLoadQuery`](../use-lazy-load-query) or [`useFragment`](../use-fragment)) used in descendants of this provider component will use the Relay environment specified here

<DocsRating/>
