/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4ab5f52f2eafc65da25c42ff27fc6808>>
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
declare export opaque type RelayModernEnvironmentNoInlineTestWithArgs_noInline$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType: RelayModernEnvironmentNoInlineTestWithArgs_noInline$ref;
export type RelayModernEnvironmentNoInlineTestWithArgs_noInline = {|
  +profile_picture?: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_inner$ref,
  +$refType: RelayModernEnvironmentNoInlineTestWithArgs_noInline$ref,
|};
export type RelayModernEnvironmentNoInlineTestWithArgs_noInline$data = RelayModernEnvironmentNoInlineTestWithArgs_noInline;
export type RelayModernEnvironmentNoInlineTestWithArgs_noInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTestWithArgs_noInline$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestWithArgs_noInline$ref,
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
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "defaultValue": "JPG",
      "kind": "LocalArgument",
      "name": "fileExtension"
    },
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
  "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline",
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
          "kind": "Variable",
          "name": "cond",
          "variableName": "cond"
        },
        {
          "kind": "Variable",
          "name": "fileExtension",
          "variableName": "fileExtension"
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
  (node/*: any*/).hash = "8541107c8da22deef0a7e355409ab1d0";
}

module.exports = node;
