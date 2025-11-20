/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<be45244915b44f0eef21ccfd8a03f836>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverTestQueryUsersFragment$data = ReadonlyArray<{|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType,
|}>;
export type RelayModernFragmentSpecResolverTestQueryUsersFragment$key = ReadonlyArray<{
  +$data?: RelayModernFragmentSpecResolverTestQueryUsersFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType,
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
  "name": "RelayModernFragmentSpecResolverTestQueryUsersFragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d549c518f9f88f95d48fe6419cc1f5ca";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType,
  RelayModernFragmentSpecResolverTestQueryUsersFragment$data,
>*/);
