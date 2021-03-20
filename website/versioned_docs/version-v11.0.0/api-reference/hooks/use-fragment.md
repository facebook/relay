---
id: use-fragment
title: useFragment
slug: /api-reference/use-fragment/
---

import DocsRating from '@site/src/core/DocsRating';

## `useFragment`

```js
import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('React');

const {graphql, useFragment} = require('react-relay');

type Props = {
  user: UserComponent_user$key,
};

function UserComponent(props: Props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name
        profile_picture(scale: 2) {
          uri
        }
      }
    `,
    props.user,
  );

  return (
    <>
      <h1>{data.name}</h1>
      <div>
        <img src={data.profile_picture?.uri} />
      </div>
    </>
  );
}
```

### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal.
* `fragmentReference`: The *fragment reference* is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{ name: ?string, profile_picture: ?{ uri: ?string } }`.

### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states) guide.


<DocsRating />
