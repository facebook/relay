/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b4a949da1b446bf61c6d16c984eab7c4>>
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
  +$refType: DataCheckerTest19Fragment$fragmentType,
  +$fragmentType: DataCheckerTest19Fragment$fragmentType,
|};
export type DataCheckerTest19Fragment = DataCheckerTest19Fragment$data;
export type DataCheckerTest19Fragment$key = {
  +$data?: DataCheckerTest19Fragment$data,
  +$fragmentRefs: DataCheckerTest19Fragment$fragmentType,
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
