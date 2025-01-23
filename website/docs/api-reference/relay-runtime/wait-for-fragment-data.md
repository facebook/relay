---
id: wait-for-fragment-data
title: waitForFragmentData
slug: /api-reference/wait-for-fragment-data/
description: Read the value of a fragment as a promise
keywords:
  - promise
  - fragment
---

import DocsRating from '@site/src/core/DocsRating';

:::warning
`waitForFragmentData` is still an experimental API. It currently has some limitations and may evolve slightly during this phase.
:::

## `waitForFragmentData`

In some cases it can be useful to define data that you wish to read using a GraphQL fragment, but then consume it just once outside of React render function. `waitForFragmentData` allows you to wait for the data of a fragment to be avalaible,

To read a fragment's data as it changes over time, see [`observeFragment`](./observe-fragment.md).

### Example: Deferring data used in an event handler

One use case for `waitForFragmentData` is to defer fetching data that is needed inside an event handler, but is not needed to render the initial view.

```tsx
import { useCallback } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { waitForFragmentData } from "relay-runtime/experimental";

function MyComponent({ key }) {
  const user = useFragment(
    graphql`
      fragment UserFragment on User {
        name
        # Page load can complete before this data has streamed in from the server.
        ...EventHandlerFragment @defer
      }
    `,
    key,
  );

  const onClick = useCallback(async () => {
    // Once the user clicks, we may need to wait for the data to finish loading.
    const userData = await waitForFragmentData(
      graphql`
        fragment EventHandlerFragment on User {
          age
        }
      `,
      user,
    );

    if (userData.age < 10) {
      alert("Hello kiddo!");
    } else if (userData.age < 18) {
      alert("Hello young person!");
    } else {
      alert("Hello adult person!");
    }
  }, [user]);

  return (
    <div>
      My name is {user.name}
      <button onClick={onClick}>Greet</button>
    </div>
  );
}
```

### Arguments

* `environment`: `IEnvironment`. A Relay environment.
* `fragment`: GraphQL fragment specified using a `graphql` template literal.
* `fragmentReference`: The *fragment reference* is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

### Return Value

* A `Promise<T>` where `T` is the data defined in the fragment.

The Promise will wait for all network data to become avaliable as well as any [`@live` Relay Resolver](../../guides/relay-resolvers/live-fields.md) to be in a non-suspended state before it resolves.

In the case of a network error, or a field-level error due to [`@throwOnFieldError`](../../guides/throw-on-field-error-directive.md) or [`@required(action: THROW)`](../../guides/required-directive.md), the Promise will reject with an error.

<DocsRating />
