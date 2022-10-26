/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<178be67a190cd610ba530731064956fe>>
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
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
|};
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
