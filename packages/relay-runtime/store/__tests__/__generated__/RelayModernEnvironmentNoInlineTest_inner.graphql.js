/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e6ccd6990e53d1c9b5e7c79cf8af97cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_inner$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_inner$ref = RelayModernEnvironmentNoInlineTest_inner$fragmentType;
export type RelayModernEnvironmentNoInlineTest_inner$data = {|
  +profile_picture_inner?: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentNoInlineTest_inner$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTest_inner = RelayModernEnvironmentNoInlineTest_inner$data;
export type RelayModernEnvironmentNoInlineTest_inner$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_inner$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_inner$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTest_inner$fragmentType,
  RelayModernEnvironmentNoInlineTest_inner$data,
>*/);
