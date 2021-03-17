---
id: upgrading-to-relay-hooks
title: Upgrading to Relay Hooks
slug: /migration-and-compatibility/
---

[Relay Hooks](/blog/2021/03/09/introducing-relay-hooks) is a set of new Hooks-based APIs for using Relay with React that improves upon the existing container-based APIs.

In this we will cover how to start using Relay Hooks, what you need to know about compatibility, and how to migrate existing container-based code to Hooks if you choose to do so. However, note that migrating existing code to Relay Hooks is ***not*** required, and **container-based code will continue to work**.

## Accessing Relay Hooks

Make sure the latest versions of React and Relay are installed, and that you’ve followed additional setup in our [Installation & Setup](../getting-started/installation-and-setup/) guide:

```
yarn add react react-dom react-relay
```

Then, you can import Relay Hooks from the **`react-relay`** module, or if you only want to include Relay Hooks in your bundle, you can import them from **`react-relay/hooks`**:

```js
import {graphql, useFragment} from 'react-relay'; // or 'react-relay/hooks'

// ...
```

## Next Steps

Check out the following guides in this section:
* [Suspense Compatibility](./suspense-compatibility/)
* [Relay Hooks and Legacy Container APIs](./relay-hooks-and-legacy-container-apis/)


For more documentation on the APIs themselves, check out our [API Reference](../api-reference/relay-environment-provider) or our [Guided Tour](../guided-tour/).
