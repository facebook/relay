---
id: defining-fields
title: "Defining Fields"
slug: /api-reference/relay-resolvers/defining-fields/
description: How to define fields for your client state schema using Relay Resolvers
keywords:
- resolvers
- derived
- selectors
- reactive
---

Defining fields on a client type is as simple as defining a resolver function which accepts an instance of your model type [TODO link] as its first argument and returns the field value. Note that the exported function name must match the field name.


A simple field might look something like this:

```tsx
/**
 * @RelayResolver User.name: String
 */
export function name(user: UserModel): string {
  return user.name;
}
```

:::note
Relay will take care of recomputing your resolver when the model changes, so you don’t need to worry about memoizing your resolver function.
:::

To lean more see:

* Resolver return types
* Resolver arguments
* Resolvers that change over time
* Derived resolvers