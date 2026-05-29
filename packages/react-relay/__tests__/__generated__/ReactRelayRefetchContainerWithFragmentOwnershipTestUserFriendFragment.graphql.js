/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c98739ac9e9dc9a8b47d086911c76ad2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType: FragmentType;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data = {
  readonly id: string,
  readonly username?: ?string,
  readonly $fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$key = {
  readonly $data?: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data,
  readonly $fragmentSpreads: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "6165437b3c79ab1bf442b6cbffbf9386";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data,
>*/);
