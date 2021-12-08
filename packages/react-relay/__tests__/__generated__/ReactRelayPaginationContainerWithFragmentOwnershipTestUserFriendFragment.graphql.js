/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f87b0a82b4e9b0ec161a0dd74d0f319c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType: FragmentType;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref = ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
|};
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment = ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$key = {
  +$data?: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data,
  +$fragmentSpreads: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
  ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data,
>*/);
