/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9cf276a6901d8e9ad9663ff1f62d1ebc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest19Fragment$fragmentType: FragmentType;
export type DataCheckerTest19Fragment$ref = DataCheckerTest19Fragment$fragmentType;
export type DataCheckerTest19Fragment$data = {|
  +maybeNodeInterface: ?{|
    +id?: string,
    +name?: ?string,
  |},
  +$fragmentType: DataCheckerTest19Fragment$fragmentType,
|};
export type DataCheckerTest19Fragment = DataCheckerTest19Fragment$data;
export type DataCheckerTest19Fragment$key = {
  +$data?: DataCheckerTest19Fragment$data,
  +$fragmentSpreads: DataCheckerTest19Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest19Fragment",
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
  (node/*: any*/).hash = "ef2e1ac40157772442135197b062076d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest19Fragment$fragmentType,
  DataCheckerTest19Fragment$data,
>*/);
