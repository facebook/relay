/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<68d830b048ea6f1f1b6bda68cae7859b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType: FragmentType;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref = ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data = {|
  +id: string,
  +username?: ?string,
  +$fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment = ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$key = {
  +$data?: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data,
  +$fragmentSpreads: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
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
  (node/*: any*/).hash = "6165437b3c79ab1bf442b6cbffbf9386";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data,
>*/);
