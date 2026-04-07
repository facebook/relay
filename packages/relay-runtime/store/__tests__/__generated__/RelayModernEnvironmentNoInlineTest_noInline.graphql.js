/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<76c24fcca754a33492c713700eac0bc7>>
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
declare export opaque type RelayModernEnvironmentNoInlineTest_noInline$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_noInline$data = {|
  +profile_picture?: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_inner$fragmentType,
  +$fragmentType: RelayModernEnvironmentNoInlineTest_noInline$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTest_noInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_noInline$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_noInline$fragmentType,
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
            (v0/*:: as any*/),
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
        (v0/*:: as any*/)
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
  (node/*:: as any*/).hash = "e69851050102bb98a80e11aa48993f20";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentNoInlineTest_noInline$fragmentType,
  RelayModernEnvironmentNoInlineTest_noInline$data,
>*/);
