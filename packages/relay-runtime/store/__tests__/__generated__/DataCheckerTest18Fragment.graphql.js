/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4bc79a0e82ecca28d41019a053eb461f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest18Fragment$fragmentType: FragmentType;
export type DataCheckerTest18Fragment$ref = DataCheckerTest18Fragment$fragmentType;
export type DataCheckerTest18Fragment$data = {|
  +maybeNodeInterface: ?{|
    +id?: string,
    +name?: ?string,
  |},
  +$fragmentType: DataCheckerTest18Fragment$fragmentType,
|};
export type DataCheckerTest18Fragment = DataCheckerTest18Fragment$data;
export type DataCheckerTest18Fragment$key = {
  +$data?: DataCheckerTest18Fragment$data,
  +$fragmentSpreads: DataCheckerTest18Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest18Fragment",
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
  (node/*: any*/).hash = "bd31e1fe5bb6cf70c70ce28aad9dd048";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest18Fragment$fragmentType,
  DataCheckerTest18Fragment$data,
>*/);
