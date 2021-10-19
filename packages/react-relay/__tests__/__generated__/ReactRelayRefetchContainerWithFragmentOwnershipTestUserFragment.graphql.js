/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f41bdc1ac5a848e4b5d793ee7b1e7bd8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$fragmentType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment = {|
  +id: string,
  +name?: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment$ref,
  +$refType: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref,
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$data = ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$data,
  +$fragmentRefs: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref,
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

module.exports = node;
