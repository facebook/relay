## React APIs for Relay

This package contains a collection of React APIs: Hooks and Components that are
integrated with Relay runtime.

Example:

```js
// @flow

import type {UserComponent_user$key} from 'UserComponent_user.graphql';

const React = require('react');

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

For complete API reference, visit https://relay.dev/.
