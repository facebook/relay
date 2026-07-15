/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<90ca623bceb912738b145ffa2a47d4c9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest19Fragment$fragmentType: FragmentType;
export type DataCheckerTest19Fragment$data = {
  readonly maybeNodeInterface: ?{
    readonly id?: string,
    readonly name?: ?string,
  },
  readonly $fragmentType: DataCheckerTest19Fragment$fragmentType,
};
export type DataCheckerTest19Fragment$key = {
  readonly $data?: DataCheckerTest19Fragment$data,
  readonly $fragmentSpreads: DataCheckerTest19Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "ef2e1ac40157772442135197b062076d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest19Fragment$fragmentType,
  DataCheckerTest19Fragment$data,
>*/);
