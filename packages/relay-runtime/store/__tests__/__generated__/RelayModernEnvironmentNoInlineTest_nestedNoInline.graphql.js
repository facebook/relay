/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a35182da70c355bcffc4bac5ede93e73>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInline$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline = {|
  +name?: ?string,
  +$refType: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref,
|};
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$data = RelayModernEnvironmentNoInlineTest_nestedNoInline;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_nestedNoInline$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline",
  "selections": [
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "03fe30da355c92ff890c6c4988eb3ec3";
}

module.exports = node;
