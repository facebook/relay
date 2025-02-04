---
id: runtime-config
title: Runtime Configuration
slug: /api-reference/runtime-config/
description: Configuring the Relay Runtime
keywords:
  - feature flags
  - configuration
---

## ConnectionInterface

If your server's implementation of the Connection Spec differs from the default interface you will need to configure the Relay Runtime to expect the connection type and field names used in your schema. This is done by updating the global ConnectionInterface instance exported by Relay:

:::note
You will also need to update your Relay Compiler Config with these same values.
:::

```ts title="/src/ConfigureRelay.ts"
import { ConnectionInterface } from 'relay-runtime';

// Note: This must match the values configured in the Relay compiler config.
ConnectionInterface.inject({
  END_CURSOR: 'end_cursor',
  HAS_NEXT_PAGE: 'has_next_page',
  HAS_PREV_PAGE: 'has_previous_page',
  START_CURSOR: 'start_cursor',
  PAGE_INFO: 'page_info',
  NODE: 'node',
  CURSOR: 'cursor',
  EDGES: 'edges',
  PAGE_INFO_TYPE: 'PageInfo',
});
```

## Feature Flags

:::warning
Feature Flags are used for enabling and configuring unstable Relay features, **regular use of Relay should not need to modify runtime feature flags**. They are documented here for purely informational purposes
:::

Relay has a number of runtime options called "Feature Flags". In general, these are used for enabling experimental features which are not yet stable and thus not yet enabled by default.

Feature flags in the Relay Runtime are implemented as a global mutable object. To set/configure a feature flag, import that object and mutate it. If you do this in the module scope, the updates will apply before Relay looks at them.

```ts title="/src/ConfigureRelay.ts"
import { RelayFeatureFlags } from 'relay-runtime';

RelayFeatureFlags.ENABLE_SOME_EXPERIMENT = true;
```

You can find the full list of feature flags [here](https://github.com/facebook/relay/blob/203d8b10e9144a37466b8a72edbe6add48f64e7d/packages/relay-runtime/util/RelayFeatureFlags.js#L4), but keep in mind that **feature flags may change arbitrarily between versions of Relay**.
