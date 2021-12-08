/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<264a3f473f322b176d01332cd0681123>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernSelectorTestUsersFragment$fragmentType: FragmentType;
export type RelayModernSelectorTestUsersFragment$ref = RelayModernSelectorTestUsersFragment$fragmentType;
export type RelayModernSelectorTestUsersFragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernSelectorTestUsersFragment$fragmentType,
|}>;
export type RelayModernSelectorTestUsersFragment = RelayModernSelectorTestUsersFragment$data;
export type RelayModernSelectorTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: RelayModernSelectorTestUsersFragment$data,
  +$fragmentSpreads: RelayModernSelectorTestUsersFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "cond"
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
  "name": "RelayModernSelectorTestUsersFragment",
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
      "condition": "cond",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d73b00ba28b8f1fef091fd0fe810235d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernSelectorTestUsersFragment$fragmentType,
  RelayModernSelectorTestUsersFragment$data,
>*/);
