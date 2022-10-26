/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<667afef8da4ef40a83bff0c69e1e888c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType } from "./ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$fragmentType: FragmentType;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$data = {|
  +id: string,
  +name?: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$fragmentType,
  +$fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$fragmentType,
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$data,
  +$fragmentSpreads: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "kind": "RootArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment",
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
          "name": "name",
          "storageKey": null
        }
      ]
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "cond",
          "variableName": "cond"
        }
      ],
      "kind": "FragmentSpread",
      "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "00fbadab26a32ac69d9c6d12533b85f2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$fragmentType,
  ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$data,
>*/);
