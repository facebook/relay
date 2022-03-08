/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4d468675c808c98701022cdaf815ebb6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$data = {|
  +me?: ?{|
    +name: ?string,
  |},
  +viewer?: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
  +$fragmentType: RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$fragmentType,
|};
export type RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$key = {
  +$data?: RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "condition"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment",
  "selections": [
    {
      "condition": "condition",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Viewer",
          "kind": "LinkedField",
          "name": "viewer",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "actor",
              "plural": false,
              "selections": (v0/*: any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    },
    {
      "condition": "condition",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3e09cebb24166f50723abfb502abb690";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$fragmentType,
  RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$data,
>*/);
