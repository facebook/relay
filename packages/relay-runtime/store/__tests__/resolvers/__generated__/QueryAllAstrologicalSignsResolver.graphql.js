/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a72fdcef45f4717cdc32e15180a1def6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryAllAstrologicalSignsResolver$fragmentType: FragmentType;
export type QueryAllAstrologicalSignsResolver$data = {|
  +me: ?{|
    +__typename: "User",
  |},
  +$fragmentType: QueryAllAstrologicalSignsResolver$fragmentType,
|};
export type QueryAllAstrologicalSignsResolver$key = {
  +$data?: QueryAllAstrologicalSignsResolver$data,
  +$fragmentSpreads: QueryAllAstrologicalSignsResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryAllAstrologicalSignsResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6622a6153c0cf33340cb80928fe31728";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryAllAstrologicalSignsResolver$fragmentType,
  QueryAllAstrologicalSignsResolver$data,
>*/);
