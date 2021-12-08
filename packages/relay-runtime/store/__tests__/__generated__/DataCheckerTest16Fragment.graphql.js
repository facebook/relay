/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ff11cce31688eccecb1c94a951e9af98>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest16Fragment$fragmentType: FragmentType;
export type DataCheckerTest16Fragment$ref = DataCheckerTest16Fragment$fragmentType;
export type DataCheckerTest16Fragment$data = {|
  +maybeNodeInterface: ?{|
    +id?: string,
    +name?: ?string,
  |},
  +$fragmentType: DataCheckerTest16Fragment$fragmentType,
|};
export type DataCheckerTest16Fragment = DataCheckerTest16Fragment$data;
export type DataCheckerTest16Fragment$key = {
  +$data?: DataCheckerTest16Fragment$data,
  +$fragmentSpreads: DataCheckerTest16Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest16Fragment",
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
  (node/*: any*/).hash = "fd5a491f91893f190984a08933f86050";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest16Fragment$fragmentType,
  DataCheckerTest16Fragment$data,
>*/);
