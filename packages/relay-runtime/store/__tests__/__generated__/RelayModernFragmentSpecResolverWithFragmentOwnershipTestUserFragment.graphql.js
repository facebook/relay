/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<605d7562922d420b09da3205976d5794>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$ref;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref,
  +$refType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$ref,
|};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$data = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$data,
  +$fragmentRefs: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "fetchSize"
    },
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "condition": "fetchSize",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "size",
              "variableName": "size"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture",
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
        }
      ]
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3b994d79b46ec897654d4f567082023b";
}

module.exports = node;
