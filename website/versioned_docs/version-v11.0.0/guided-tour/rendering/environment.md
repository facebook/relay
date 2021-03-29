---
id: environment
title: Environment
slug: /guided-tour/rendering/environment/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbActorsAndEnvironments from './fb/FbActorsAndEnvironments.md';
import FbEnvironmentSetup from './fb/FbEnvironmentSetup.md';

## Relay Environment Provider

In order to render Relay components, you need to render a `RelayEnvironmentProvider` component at the root of the app:

```js
// App root

const {RelayEnvironmentProvider} = require('react-relay');
const Environment = require('MyEnvironment');

function Root() {
  return (
    <RelayEnvironmentProvider environment={Environment}>
      {/*... */}
    </RelayEnvironmentProvider>
  );
}
```

* The `RelayEnvironmentProvider` takes an environment, which it will make available to all descendant Relay components, and which is necessary for Relay to function.

<FbEnvironmentSetup />

## Accessing the Relay Environment

If you want to access the *current* Relay Environment within a descendant of a `RelayEnvironmentProvider` component, you can use the `useRelayEnvironment` Hook:

```js
const {useRelayEnvironment} = require('react-relay');

function UserComponent(props: Props) {
  const environment = useRelayEnvironment();

  return (...);
}
```


<FbActorsAndEnvironments />



<DocsRating />
