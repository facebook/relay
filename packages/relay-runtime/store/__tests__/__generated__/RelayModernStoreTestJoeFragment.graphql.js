/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aea33a8804c9fc355bdeb44e06a97bbe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTestJoeFragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTestJoeFragment$fragmentType: RelayModernStoreTestJoeFragment$ref;
export type RelayModernStoreTestJoeFragment = {|
  +node: ?{|
    +name?: ?string,
  |},
  +$refType: RelayModernStoreTestJoeFragment$ref,
|};
export type RelayModernStoreTestJoeFragment$data = RelayModernStoreTestJoeFragment;
export type RelayModernStoreTestJoeFragment$key = {
  +$data?: RelayModernStoreTestJoeFragment$data,
  +$fragmentRefs: RelayModernStoreTestJoeFragment$ref,
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
  (node/*: any*/).hash = "1d1655ee8f976da125360967ff9d8174";
}

module.exports = node;
