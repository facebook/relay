/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<61ca4dc169903e74364b7879fc6ebab3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest1Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest1Fragment$ref = RelayStoreUtilsTest1Fragment$fragmentType;
export type RelayStoreUtilsTest1Fragment$data = {|
  +friends: ?{|
    +count: ?number,
  |},
  +$fragmentType: RelayStoreUtilsTest1Fragment$fragmentType,
|};
export type RelayStoreUtilsTest1Fragment = RelayStoreUtilsTest1Fragment$data;
export type RelayStoreUtilsTest1Fragment$key = {
  +$data?: RelayStoreUtilsTest1Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest1Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest1Fragment$fragmentType,
  RelayStoreUtilsTest1Fragment$data,
>*/);
