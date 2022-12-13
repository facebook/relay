---
id: imperatively-modifying-linked-fields
title: Imperatively modifying linked fields
slug: /guided-tour/updating-data/imperatively-modifying-linked-fields/
description: Using readUpdatableQuery to update linked fields in the store
keywords:
- record source
- store
- updater
- typesafe updaters
- readUpdatableQuery
- readUpdatableFragment
- updatable
- assignable
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

<OssOnly>

:::caution

Because in TypeScript, [getters and setters cannot have different types](https://github.com/microsoft/TypeScript/issues/43662), and the generated types of getters and setters is not the same, `readUpdatableQuery` is currently unusable with TypeScript. `readUpdatableFragment` is usable, as long as the updatable fragment contains only scalar fields.

:::

</OssOnly>

:::note
See also [using readUpdatableQuery to update scalar fields in the store](../imperatively-modifying-store-data).
:::


The examples in the [previous section](../imperatively-modifying-store-data/) showed how to use the `readUpdatableQuery` API to update scalar fields like `is_new_comment` and `is_selected`.

The examples did **not** cover how to assign to linked fields. Let's start with an example of a component which allows the user of the application to update the Viewer's `best_friend` field.

## Example: setting the viewer's best friend

In order to assign a viewer's best friend, that viewer must have such a field. It may be defined by the server schema, or it may be defined locally in a schema extension as follows:

```graphql
extend type Viewer {
  best_friend: User,
}
```

Next, let's define a fragment and give it the `@assignable` directive, making it an **assignable fragment**. Assignable fragments can only contain a single field, `__typename`. This fragment will be on the `User` type, which is the type of the `best_friend` field.

```js
// AssignBestFriendButton.react.js
graphql`
  fragment AssignBestFriendButton_assignable_user on User @assignable {
    __typename
  }
`;
```

The fragment must be spread at both the source (i.e. on the viewer's new best friend), and at the destination (within the viewer's `best_friend` field in the updatable query).

Lets define a component with a fragment where we spread `AssignableBestFriendButton_assignable_user`. This user will be the viewer's new best friend.

```js
// AssignBestFriendButton.react.js
import type {AssignBestFriendButton_user$key} from 'AssignBestFriendButton_user.graphql';

const {useFragment} = require('react-relay');

export default function AssignBestFriendButton({
  someTypeRef: AssignBestFriendButton_user$key,
}) {
  const data = useFragment(graphql`
    fragment AssignBestFriendButton_someType on SomeType {
      user {
        name
        ...AssignableBestFriendButton_assignable_user
      }
    }
  `, someTypeRef);

  // We will replace this stub with the real thing below.
  const onClick = () => {};

  return (<button onClick={onClick}>
    Declare {data.user?.name ?? 'someone with no name'} your new best friend!
  </button>);
}
```

That's great! Now, we have a component that renders a button. Let's fill out that button's click handler by using the `commitLocalUpdate` and `readUpdatableQuery` APIs to assign `viewer.best_friend`.

* In order to make it valid to assign `data.user` to `best_friend`, we must **also** spread `AssignBestFriendButton_assignable_user` under the `best_friend` field in the viewer in the updatable query or fragment.

```js
import type {RecordSourceSelectorProxy} from 'react-relay';

const {commitLocalUpdate, useRelayEnvironment} = require('react-relay');

// ...

const environment = useRelayEnvironment();
const onClick = () => {
  const updatableData = commitLocalUpdate(
    environment,
    (store: RecordSourceSelectorProxy) => {
      const {updatableData} = store.readUpdatableQuery(
          graphql`
            query AssignBestFriendButtonUpdatableQuery
            @updatable {
              viewer {
                best_friend {
                  ...AssignableBestFriendButton_assignable_user
                }
              }
            }
          `,
          {}
        );

      if (data.user != null && updatableData.viewer != null) {
        updatableData.viewer.best_friend = data.user;
      }
    }
  );
};
```

### Putting it all together

The full example is as follows:

```graphql
extend type Viewer {
  best_friend: User,
}
```

```js
// AssignBestFriendButton.react.js
import type {AssignBestFriendButton_user$key} from 'AssignBestFriendButton_user.graphql';
import type {RecordSourceSelectorProxy} from 'react-relay';

const {commitLocalUpdate, useFragment, useRelayEnvironment} = require('react-relay');

graphql`
  fragment AssignBestFriendButton_assignable_user on User @assignable {
    __typename
  }
`;

export default function AssignBestFriendButton({
  someTypeRef: AssignBestFriendButton_someType$key,
}) {
  const data = useFragment(graphql`
    fragment AssignBestFriendButton_someType on SomeType {
      user {
        name
        ...AssignableBestFriendButton_assignable_user
      }
    }
  `, someTypeRef);

  const environment = useRelayEnvironment();
  const onClick = () => {
    const updatableData = commitLocalUpdate(
      environment,
      (store: RecordSourceSelectorProxy) => {
        const {updatableData} = store.readUpdatableQuery(
            graphql`
              query AssignBestFriendButtonUpdatableQuery
              @updatable {
                viewer {
                  best_friend {
                    ...AssignableBestFriendButton_assignable_user
                  }
                }
              }
            `,
            {}
          );

        if (data.user != null && updatableData.viewer != null) {
          updatableData.viewer.best_friend = data.user;
        }
      }
    );
  };

  return (<button onClick={onClick}>
    Declare {user.name ?? 'someone with no name'} my best friend!
  </button>);
}
```

Let's recap what is happening here.

* We are writing a component in which clicking a button results in a user is being assigned to `viewer.best_friend`. After this button is clicked, all components which were previously reading the `viewer.best_friend` field will be re-rendered, if necessary.
* The source of the assignment is a user where an **assignable fragment** is spread.
* The target of the assignment is accessed using the `commitLocalUpdate` and `readUpdatableQuery` APIs.
* The query passed to `readUpdatableQuery` must include the `@updatable` directive.
* The target field must have that same **assignable fragment** spread.
* We are checking whether `data.user` is not null before assigning. This isn't strictly necessary. However, if we assign `updatableData.viewer.best_friend = null`, we will be nulling out the linked field in the store! This is (probably) not what you want.

## Pitfalls

* Note that there are no guarantees about what fields are present on the assigned user. This means that any consumes an updated field has no guarantee that the required fields were fetched and are present on the assigned object.

<FbInternalOnly>

:::note

It is technically feasible to add fields to the assignable fragment, which would have the effect of guaranteeing that certain fields are present in the assigned object.

If this is a need, please reach out to [Relay Support](https://fb.workplace.com/groups/relay.support).

:::

</FbInternalOnly>

## Example: Assigning to a list

Let's modify the previous example to append the user to a list of best friends. In this example, the following principle is relevant:

> Every assigned linked field (i.e. the right hand side of the assignment) **must originate in a read-only fragment, query, mutation or subscription**.

This means that `updatableData.foo = updatableData.foo` is invalid. For the same reason, `updatableData.viewer.best_friends = updatableData.viewer.best_friends.concat([newBestFriend])` is invalid. To work around this restriction, we must select the existing best friends from a read-only fragment, and perform the assignment as follows: `viewer.best_friends = existing_list.concat([newBestFriend])`.

Consider the following full example:

```graphql
extend type Viewer {
  # We are now defined a "best_friends" field instead of a "best_friend" field
  best_friends: [User!],
}
```

```js
// AssignBestFriendButton.react.js
import type {AssignBestFriendButton_user$key} from 'AssignBestFriendButton_user.graphql';
import type {AssignBestFriendButton_viewer$key} from 'AssignBestFriendButton_viewer';

import type {RecordSourceSelectorProxy} from 'react-relay';

const {commitLocalUpdate, useFragment, useRelayEnvironment} = require('react-relay');

graphql`
  fragment AssignBestFriendButton_assignable_user on User @assignable {
    __typename
  }
`;

export default function AssignBestFriendButton({
  someTypeRef: AssignBestFriendButton_someType$key,
  viewerFragmentRef: AssignBestFriendButton_viewer$key,
}) {
  const data = useFragment(graphql`
    fragment AssignBestFriendButton_someType on SomeType {
      user {
        name
        ...AssignableBestFriendButton_assignable_user
      }
    }
  `, someTypeRef);

  const viewer = useFragment(graphql`
    fragment AssignBestFriendButton_viewer on Viewer {
      best_friends {
        # since viewer.best_friends appears in the right hand side of the assignment
        # (i.e. updatableData.viewer.best_friends = viewer.best_friends.concat(...)),
        # the best_friends field must contain the correct assignable fragment spread
        ...AssignableBestFriendButton_assignable_user
      }
    }
  `, viewerRef);

  const environment = useRelayEnvironment();
  const onClick = () => {
    commitLocalUpdate(
      environment,
      (store: RecordSourceSelectorProxy) => {
        const {updatableData} = store.readUpdatableQuery(
            graphql`
              query AssignBestFriendButtonUpdatableQuery
              @updatable {
                viewer {
                  best_friends {
                    ...AssignableBestFriendButton_assignable_user
                  }
                }
              }
            `,
            {}
          );

        if (data.user != null && updatableData.viewer != null && viewer.best_friends != null) {
          updatableData.viewer.best_friends = [
            ...viewer.best_friends,
            data.user,
          ];
        }
      }
    );
  };

  return (<button onClick={onClick}>
    Add {user.name ?? 'someone with no name'} to my list of best friends!
  </button>);
}
```

## Example: assigning from an abstract field to a concrete field

If you are assigning from an abstract field, e.g. a `Node` to a `User` (which implements `Node`), you must use an inline fragment to refine the `Node` type to `User`. Consider this snippet:

```js
const data = useFragment(graphql`
  fragment AssignBestFriendButton_someType on Query {
    node(id: "4") {
      ... on User {
        __typename
        ...AssignableBestFriendButton_assignable_user
      }
    }
  }
`, queryRef);

const environment = useRelayEnvironment();
const onClick = () => {
  const updatableData = commitLocalUpdate(
    environment,
    (store: RecordSourceSelectorProxy) => {
      const {updatableData} = store.readUpdatableQuery(
          graphql`
            query AssignBestFriendButtonUpdatableQuery
            @updatable {
              viewer {
                best_friend {
                  ...AssignableBestFriendButton_assignable_user
                }
              }
            }
          `,
          {}
        );

      if (data.node != null && data.node.__typename === "User" && updatableData.viewer != null) {
        updatableData.viewer.best_friend = data.node;
      }
    }
  );
};
```

In this snippet, we do two things:

* We use an inline fragment to refine the `Node` type to the `User` type. Inside of this refinement, we spread the assignable fragment.
* We check that `data.node.__typename === "User"`. This indicates to Flow that within that if block, `data.node` is known to be a user, and therefore `updatableData.viewer.best_friend = data.node` can typecheck.

## Example: assigning to an interface when the source is guaranteed to implement that interface

You may wish to assign to a destination field that has an interface type (in this example, `Actor`). If the source field is guaranteed to implement that interface, then assignment is straightforward.

For example, the source might have the same interface type or have a concrete type (`User`, in this example) that implements that interface.

Consider the following snippet:

```js
graphql`
  fragment Foo_actor on Actor @assignable {
    __typename
  }
`;

const data = useFragment(graphql`
  fragment Foo_query on Query {
    user {
      ...Foo_actor
    }
    viewer {
      actor {
        ...Foo_actor
      }
    }
  }
`, queryRef);

const environment = useRelayEnvironment();
const onClick = () => {
  commitLocalUpdate(environment, store => {
    const {updatableData} = store.readUpdatableQuery(
      graphql`
        query FooUpdatableQuery @updatable {
          viewer {
            actor {
              ...Foo_actor
            }
          }
        }
      `,
      {}
    );

    // Assigning the user works as you would expect
    if (updatableData.viewer != null && data.user != null) {
      updatableData.viewer = data.user;
    }

    // As does assigning the viewer
    if (updatableData.viewer != null && data.viewer?.actor != null) {
      updatableData.viewer = data.viewer.actor;
    }
  });
};
```

## Example: assigning to an interface when the source is **not** guaranteed to implement that interface

You may wish to assign to a destination field that has an interface type (in this example, `Actor`). If the source type (e.g. `Node`) is **not** known to implement that interface, then an extra step is involved: validation.

<FbInternalOnly>

:::note

With additional changes to Relay's type generation, this can be made simpler. Please reach out to [Robert Balicki](https://www.internalfb.com/profile/view/1238951) if this is a pain point for you.

:::

</FbInternalOnly>

In order to understand why, some background is necessary. The flow type for the setter for an interface field might look like:

```js
set actor(value: ?{
  +__id: string,
  +__isFoo_actor: string,
  +$fragmentSpreads: Foo_actor$fragmentType,
  ...
}): void,
```

The important thing to note is that the setter expects an object with a non-null `__isFoo_actor` field.

When an assignable fragment with an abstract type is spread in a regular fragment, it results in an `__isFoo_actor: string` selection that is not optional if the type is known to implement the interface, and optional otherwise.

Since a `Node` is **not** guaranteed to implement `Actor`, when the Relay compiler encounters the selection `node(id: "4") { ...Foo_actor }`, it will emit an optional field (`__isFoo_actor?: string`). Attempting to assign this to `updatableData.viewer.actor` will not typecheck!

### Introducing validators

The generated file for every generated artifact includes a named `validator` export. In our example, the function is as follows:

```js
function validate(value/*: {
  +__id: string,
  +__isFoo_actor?: string,
  +$fragmentSpreads: Foo_actor$fragmentType,
  ...
}*/)/*: false | {
  +__id: string,
  +__isFoo_actor: string,
  +$fragmentSpreads: Foo_actor$fragmentType,
  ...
}*/ {
  return value.__isFoo_actor != null ? (value/*: any*/) : false;
}
```

In other words, this function checks for the presence of the `__isFoo_actor` field. If it is found, it returns the same object, but with a flow type that is valid for assignment. If not, it returns false.

### Example

Let's put this all together in an example:

```js
import {validate as validateActor} from 'Foo_actor.graphql';

graphql`
  fragment Foo_actor on Actor @assignable {
    __typename
  }
`;

const data = useFragment(graphql`
  fragment Foo_query on Query {
    node(id: "4") {
      ...Foo_actor
    }
  }
`, queryRef);

const environment = useRelayEnvironment();
const onClick = () => {
  commitLocalUpdate(environment, store => {
    const {updatableData} = store.readUpdatableQuery(
      graphql`
        query FooUpdatableQuery @updatable {
          viewer {
            actor {
              ...Foo_actor
            }
          }
        }
      `,
      {}
    );

    if (updatableData.viewer != null && data.node != null) {
      const validActor = validateActor(data.node);
      if (validActor !== false) {
        updatableData.viewer.actor = validActor;
      }
    }
  });
};
```

### Can flow be used to infer the presence of this field?

Unfortunately, if you check for the presence of `__isFoo_actor`, Flow does not infer that (on the type level), the field is not optional. Hence, we need to use validators.

<DocsRating />
