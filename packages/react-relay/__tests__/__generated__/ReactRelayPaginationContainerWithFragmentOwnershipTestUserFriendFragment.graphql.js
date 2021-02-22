/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<920ad2b5848eef521d9f09c11a01ef63>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref: FragmentReference;
declare export opaque type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment = {|
  +id: string,
  +name?: ?string,
  +$refType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref,
|};
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data = ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$key = {
  +$data?: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data,
  +$fragmentRefs: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "isViewerFriendLocal"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "isViewerFriendLocal",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3c7b2ad9c88055de7baca8e5cec24574";
}

module.exports = node;
