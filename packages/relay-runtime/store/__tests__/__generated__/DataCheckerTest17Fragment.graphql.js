/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bb9d457b4b172b790bd43ccb658386d0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest17Fragment$fragmentType: FragmentType;
export type DataCheckerTest17Fragment$ref = DataCheckerTest17Fragment$fragmentType;
export type DataCheckerTest17Fragment$data = {|
  +maybeNodeInterface: ?{|
    +id?: string,
    +name?: ?string,
  |},
  +$fragmentType: DataCheckerTest17Fragment$fragmentType,
|};
export type DataCheckerTest17Fragment = DataCheckerTest17Fragment$data;
export type DataCheckerTest17Fragment$key = {
  +$data?: DataCheckerTest17Fragment$data,
  +$fragmentSpreads: DataCheckerTest17Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest17Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "maybeNodeInterface",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            }
          ],
          "type": "Node",
          "abstractKey": "__isNode"
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "type": "NonNodeNoID",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f6096f3499a8b5fa2d4ee04f74a8b697";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest17Fragment$fragmentType,
  DataCheckerTest17Fragment$data,
>*/);
