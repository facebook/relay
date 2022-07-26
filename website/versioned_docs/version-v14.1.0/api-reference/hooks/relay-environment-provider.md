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

const {RelayEnvironmentProvider} = require('react-relay');

const Environment = createNewEnvironment();

function Root() {
  return (
    <RelayEnvironmentProvider environment={Environment}>
      <App />
    </RelayEnvironmentProvider>
  );
}

module.exports = Root;
```

### Props

* `environment`: The Relay environment to set in React Context. Any Relay Hooks (like [`useLazyLoadQuery`](../use-lazy-load-query) or [`useFragment`](../use-fragment)) used in descendants of this provider component will use the Relay environment specified here

<DocsRating/>
