---
id: use-relay-environment
title: useRelayEnvironment
slug: /api-reference/use-relay-environment/
---

import DocsRating from '@site/src/core/DocsRating';

## `useRelayEnvironment`

Hook used to access a Relay environment that was set by a [`RelayEnvironmentProvider`](../relay-environment-provider):

```js
const React = require('React');

const {useRelayEnvironment} = require('react-relay');

function MyComponent() {
  const environment = useRelayEnvironment();

  const handler = useCallback(() => {
    // For example, can be used to pass the environment to functions
    // that require a Relay environment.
    commitMutation(environment, ...);
  }, [environment])

  return (...);
}

module.exports = MyComponent;
```

<DocsRating />
