/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9355ef70efb895879886c3eefbbb8e36>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentNoInlineTest_inner$fragmentType } from "./RelayModernEnvironmentNoInlineTest_inner.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestWithArgs_noInline$data = {|
  +profile_picture?: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_inner$fragmentType,
  +$fragmentType: RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestWithArgs_noInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTestWithArgs_noInline$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType,
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
  (node/*: any*/).hash = "c176d8758682964446ea51b58b3a3f76";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType,
  RelayModernEnvironmentNoInlineTestWithArgs_noInline$data,
>*/);
