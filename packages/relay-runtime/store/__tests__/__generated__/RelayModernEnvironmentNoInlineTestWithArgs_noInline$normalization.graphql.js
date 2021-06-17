/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ec711a4f1cb14ac686f563163975d57b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = (function(){
var v0 = {
  "kind": "Variable",
  "name": "preset",
  "variableName": "preset"
},
v1 = {
  "kind": "Variable",
  "name": "size",
  "variableName": "size"
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$cond"
    },
    {
      "defaultValue": "JPG",
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$fileExtension"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$normalization",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": "profile_picture",
          "args": [
            {
              "kind": "Literal",
              "name": "fileExtension",
              "value": "PNG"
            },
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture2",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        },
        {
          "condition": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$cond",
          "kind": "Condition",
          "passingValue": true,
          "selections": [
            {
              "alias": "profile_picture_inner",
              "args": [
                {
                  "kind": "Variable",
                  "name": "fileExtension",
                  "variableName": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$fileExtension"
                },
                (v0/*: any*/),
                (v1/*: any*/)
              ],
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "profilePicture2",
              "plural": false,
              "selections": (v2/*: any*/),
              "storageKey": null
            }
          ]
        }
      ],
      "type": "User",
      "abstractKey": null
    }
  ]
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8541107c8da22deef0a7e355409ab1d0";
}

module.exports = node;
