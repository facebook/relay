/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<059c962f937e72a6c2c98e72501caa1c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_inner$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTest_inner$fragmentType: RelayModernEnvironmentNoInlineTest_inner$ref;
export type RelayModernEnvironmentNoInlineTest_inner = {|
  +profile_picture_inner?: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernEnvironmentNoInlineTest_inner$ref,
|};
export type RelayModernEnvironmentNoInlineTest_inner$data = RelayModernEnvironmentNoInlineTest_inner;
export type RelayModernEnvironmentNoInlineTest_inner$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_inner$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_inner$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "fileExtension"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "preset"
    },
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_inner",
  "selections": [
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": "profile_picture_inner",
          "args": [
            {
              "kind": "Variable",
              "name": "fileExtension",
              "variableName": "fileExtension"
            },
            {
              "kind": "Variable",
              "name": "preset",
              "variableName": "preset"
            },
            {
              "kind": "Variable",
              "name": "size",
              "variableName": "size"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture2",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "94488d2ae2c4b79e35879d38212fcf35";
}

module.exports = node;
