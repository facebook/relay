/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9f95a64850e1564edf3d844ca9aff7c>>
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
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$data = {|
  +id: string,
  +username?: ?string,
  +$fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
|};
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
