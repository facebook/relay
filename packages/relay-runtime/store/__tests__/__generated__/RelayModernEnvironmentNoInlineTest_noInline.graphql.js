/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5ca2c441d6697978a4cc24596c073a84>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTest_inner$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_noInline$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTest_noInline$fragmentType: RelayModernEnvironmentNoInlineTest_noInline$ref;
export type RelayModernEnvironmentNoInlineTest_noInline = {|
  +profile_picture?: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_inner$ref,
  +$refType: RelayModernEnvironmentNoInlineTest_noInline$ref,
|};
export type RelayModernEnvironmentNoInlineTest_noInline$data = RelayModernEnvironmentNoInlineTest_noInline;
export type RelayModernEnvironmentNoInlineTest_noInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_noInline$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_noInline$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "Variable",
  "name": "preset",
  "variableName": "preset"
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "preset"
    },
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_noInline",
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
      ],
      "type": "User",
      "abstractKey": null
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "cond",
          "value": true
        },
        {
          "kind": "Literal",
          "name": "fileExtension",
          "value": "JPG"
        },
        (v0/*: any*/)
      ],
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentNoInlineTest_inner"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6bd80bb9c64c065763c7ddc0ef046c62";
}

module.exports = node;
