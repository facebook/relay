/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9011768166593f563854a3e8c79e9757>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type RelayModernEnvironmentNoInlineTest_noInline$normalization = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +profile_picture_inner: ?{|
    +uri: ?string,
  |},
|};

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
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTest_noInline$normalization",
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
          "alias": "profile_picture_inner",
          "args": [
            {
              "kind": "Literal",
              "name": "fileExtension",
              "value": "JPG"
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
      ],
      "type": "User",
      "abstractKey": null
    }
  ]
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6bd80bb9c64c065763c7ddc0ef046c62";
}

module.exports = node;
