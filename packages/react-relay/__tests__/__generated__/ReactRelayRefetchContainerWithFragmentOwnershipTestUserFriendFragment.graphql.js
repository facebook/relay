/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e224ee7876c5b9f82e8639473025a919>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref: FragmentReference;
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment = {|
  +id: string,
  +username?: ?string,
  +$refType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref,
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data = ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$key = {
  +$data?: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data,
  +$fragmentRefs: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref,
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

module.exports = node;
