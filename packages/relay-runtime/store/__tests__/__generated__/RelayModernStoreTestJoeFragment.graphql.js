/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<274b6d5eb8d3a43bfa5ccbf142758f98>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTestJoeFragment$fragmentType: FragmentType;
export type RelayModernStoreTestJoeFragment$data = {|
  +node: ?{|
    +name?: ?string,
  |},
  +$fragmentType: RelayModernStoreTestJoeFragment$fragmentType,
|};
export type RelayModernStoreTestJoeFragment$key = {
  +$data?: RelayModernStoreTestJoeFragment$data,
  +$fragmentSpreads: RelayModernStoreTestJoeFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "id"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreTestJoeFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "id"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
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
          "type": "User",
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
  (node/*:: as any*/).hash = "1d1655ee8f976da125360967ff9d8174";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreTestJoeFragment$fragmentType,
  RelayModernStoreTestJoeFragment$data,
>*/);
