/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ce0b7958f907a51b2e9ea9c1f43ba90>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$ref = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
  +$fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
|}>;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data,
>*/);
