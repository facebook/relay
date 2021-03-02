/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cfdacb5220122ffa5a563e1cd19dc372>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest1Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest1Fragment$fragmentType: RelayStoreUtilsTest1Fragment$ref;
export type RelayStoreUtilsTest1Fragment = {|
  +friends: ?{|
    +count: ?number,
  |},
  +$refType: RelayStoreUtilsTest1Fragment$ref,
|};
export type RelayStoreUtilsTest1Fragment$data = RelayStoreUtilsTest1Fragment;
export type RelayStoreUtilsTest1Fragment$key = {
  +$data?: RelayStoreUtilsTest1Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "order"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 10
        },
        {
          "kind": "Variable",
          "name": "orderby",
          "variableName": "order"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ab09c5cae343cde308a865567d24ceab";
}

module.exports = node;
