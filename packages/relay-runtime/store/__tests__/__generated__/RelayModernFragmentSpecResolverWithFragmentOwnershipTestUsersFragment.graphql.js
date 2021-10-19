/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6f844619a3fc3f00b77634001234dbab>>
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
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$ref: FragmentReference;
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$ref;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref,
  +$refType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$ref,
|}>;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data,
  +$fragmentRefs: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$ref,
  ...
}>;
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
  "metadata": {
    "plural": true
  },
  "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment",
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
  (node/*: any*/).hash = "f7a3d2c363740f133497c1eba167af9d";
}

module.exports = node;
