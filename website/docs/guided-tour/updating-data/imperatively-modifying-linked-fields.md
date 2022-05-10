---
id: imperatively-modifying-linked-fields
title: Imperatively modifying linked fields
slug: /guided-tour/updating-data/imperatively-modifying-linked-fields/
description: Using readUpdatableQuery_EXPERIMENTAL to update linked fields in the store
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
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

<OssOnly>

:::caution

Because in TypeScript, [getters and setters cannot have different types](https://github.com/microsoft/TypeScript/issues/43662), and the generated types of getters and setters is not the same, `readUpdatableQuery_EXPERIMENTAL` is currently unusable with TypeScript. `readUpdatableFragment_EXPERIMENTAL` is usable, as long as the updatable fragment contains only scalar fields.

:::

</OssOnly>

:::note
See also [using readUpdatableQuery_EXPERIMENTAL to update scalar fields in the store](../imperatively-modifying-store-data).
:::


The examples in the [previous section](../imperatively-modifying-store-data/) showed how to use the `readUpdatableQuery_EXPERIMENTAL` API to update scalar fields like `is_new_comment` and `is_selected`.

The examples did **not** cover how to assign to linked fields. Let's start with an example of a component which allows the user of the application to update the Viewer's `best_friend` field.

## Example: setting the viewer's best friend

The first thing we do is to define a client schema extension adding the field to the Viewer type.

```graphql
extend type Viewer {
  best_friend: User,
}
```

Next, let's define a fragment and give it the `@assignable` directive, making it an **assignable fragment**. Assignable fragments can only contain a single field, `__typename`. This fragment will be on the `User` type.

```js
// AssignBestFriendButton.react.js
graphql`
  fragment AssignBestFriendButton_assignable_user on User @assignable {
    __typename
  }
`;
```

The file that the Relay compiler generates for assignable fragments will contain a single named JavaScript export, a `validate` function, in addition to exports of types. This function performs a runtime check to determine whether a particular item is valid for assignment. If the item is invalid, the validator will return `false`.

In this case, because we are assigning a User, this **validator** will check whether the item's `__typename` field is equal to the literal string `"User"`.

Lets import the generated validate function.

```js
// AssignBestFriendButton.react.js
import {validate as ValidateUser} from 'AssignableBestFriendButton_assignable_user.graphql';
```

Next, lets define a component that accepts a User fragment reference. In the fragment, we will spread `AssignableBestFriendButton_assignable_user`.

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

That's great! Now, we have a component that renders a button. Let's fill out that button's click handler by using the `commitLocalUpdate` and `readUpdatableQuery_EXPERIMENTAL` APIs to assign `viewer.best_friend`.

* In order to make it valid to assign `data.user` to `best_friend`, we must **also** spread `AssignBestFriendButton_assignable_user` under the `best_friend` field in the viewer in the updatable query or fragment.
* In addition, we must pass `user` through the imported `validateUser` function.

<FbInternalOnly>

:::info

With further improvements to our type generation, runtime validation will be required in fewer situations.

In this case, the source for assignment is a User, which we statically know has the concrete type User, meaning that the `__typename` field will have the value `"User"`. Unfortunately, the generated type only indicates that the `__typename` field has type `string`.

If the generated types were updated to reflect this fact, validation would not be necessary in this instance.

We hope to implement this as part of a broader improvement to our typegen.

:::

</FbInternalOnly>

```js
import type {RecordSourceSelectorProxy} from 'react-relay';

const {commitLocalUpdate, useRelayEnvironment} = require('react-relay');

// ...

const environment = useRelayEnvironment();
const onClick = () => {
  const updatableData = commitLocalUpdate(
    environment,
    (store: RecordSourceSelectorProxy) => {
      const {updatableData} = store.readUpdatableQuery_EXPERIMENTAL(
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

      const user = data.user;
      if (user != null && updatableData.viewer != null) {
        const validUser = validateUser(user);
        if (validUser !== false) {
          updatableData.viewer.best_friend = validUser;
        }
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
import {validate as ValidateUser} from 'AssignableBestFriendButton_assignable_user.graphql';
import type {AssignBestFriendButton_user$key} from 'AssignBestFriendButton_user.graphql';
import type {RecordSourceSelectorProxy} from 'react-relay';

const {commitLocalUpdate, useFragment, useRelayEnvironment} = require('react-relay');

graphql`
  fragment AssignBestFriendButton_assignable_user on User @assignable {
    __typename
  }
`;

export default function AssignBestFriendButton({
  userFragmentRef: AssignBestFriendButton_someType$key,
}) {
  const data = useFragment(graphql`
    fragment AssignBestFriendButton_someType on SomeType {
      user {
        name
        ...AssignableBestFriendButton_assignable_user
      }
    }
  `, userFragmentRef);

  const environment = useRelayEnvironment();
  const onClick = () => {
    const updatableData = commitLocalUpdate(
      environment,
      (store: RecordSourceSelectorProxy) => {
        const {updatableData} = store.readUpdatableQuery_EXPERIMENTAL(
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

        const user = data.user;
        if (user != null && updatableData.viewer != null) {
          const validUser = validateUser(user);
          if (validUser !== false) {
            updatableData.viewer.best_friend = validUser;
          }
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
* The target of the assignment is accessed using the `commitLocalUpdate` and `readUpdatableQuery_EXPERIMENTAL` APIs.
* The query passed to `readUpdatableQuery_EXPERIMENTAL` must include the `@updatable` directive.
* Finally, in order to have `updatableData.viewer.best_friend = something` typecheck, we must:
  * validate that the `viewer` is not null,
  * validate that the `user` is not null, and
  * validate that the source (`user`) is valid for assignment by using the `validateUser` function.

## Pitfalls

* Note that there are no guarantees about what fields are present on the assigned user. This means that any consumes an updated field has no guarantee that the required fields were fetched and are present on the assigned object.

<FbInternalOnly>

:::note

It is technically feasible to add fields to the assignable fragment, which would have the effect of guaranteeing that certain fields are present in the assigned object.

If this is a need, please reach out to [Robert Balicki](https://www.internalfb.com/profile/view/1238951).

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
import {validate as ValidateUser} from 'AssignableBestFriendButton_assignable_user.graphql';
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
        const {updatableData} = store.readUpdatableQuery_EXPERIMENTAL(
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

        // See the note above about reducing the cases in which we need to validate
        // at runtime.
        const existingBestFriends = viewer.best_friends == null ? [] : viewer.best_friends
          .flatMap(friend => {
            const validFriend = validateUser(friend);
            if (validFriend === false) {
              return [];
            } else {
              return [validFriend];
            }
          });

        const user = data.user;
        if (updatableData.viewer != null && user != null) {
          const validUser = validateUser(user);
          if (validUser !== false) {
            updatableData.viewer.best_friends = existingBestFriends.concat([validUser]);
          }
        }
      }
    );
  };

  return (<button onClick={onClick}>
    Add {user.name ?? 'someone with no name'} to my list of best friends!
  </button>);
}
```

## Validation and type refinement

Validation is a runtime check to ensure that the source is valid for assignment. If the destination field has a concrete type, the validator checks that the `__typename` field has the correct value (e.g. `"User"` in the previous examples.)

In some cases, you can do this yourself without the need for a validator. If you have a linked field with an interface type and containing only inline fragments refining the type to a concrete field, where each inline fragment contains a `__typename` selection, then the generated flowtype will be a **discriminated union with the `__typename` field as discriminator**. In cases like this, you use the `__typename` field for refinement and avoid using the validator.

Example:

```js
const data = useFragment(graphql`
  fragment TestComponent_bar on SomeType {
    node(id: "4") {
      ... on User {
        __typename
        ...MyAssignableFragment_assignable_user
      }
      # other selections
    }
  }
`, fragmentReference);

const onClick = () => {
  commitLocalUpdate(
    environment,
    store => {
      const {updatableData} = store.readUpdatableQuery_EXPERIMENTAL(
        graphql`
          TestComponentUpdatableQuery {
            best_friend {
              ...MyAssignableFragment_assignable_user
            }
          }
        `
      );

      if (data.node?.__typename === 'User') {
        // because the generated type for data has a discriminated union at data.node,
        // in this block, flow correctly infers that data.node has typename "User"
        // and you can assign the user without runtime validation
        updatableData.best_friend = data.node;
      }
    }
  )
}
```

## Validation when the destination field is an interface

From a developer's perspective, validators behave identically whether the destination field is an interface or a concrete type.

Under the hood, if the destination field is an interface, validators check for the presence of an assignable fragment marker. Assignable fragment markers are extra selections of the form `__isNameOfAssignableFragment: __typename` that are added to read-only fragments where assignable fragments are spread.

<DocsRating />
