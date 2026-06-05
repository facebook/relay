/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<523ff61c3f5ee08b96c1ac40290f4cc0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { EmptyCheckerTestFragment$fragmentType } from "./EmptyCheckerTestFragment.graphql";
export type EmptyCheckerTestFragmentSpreadQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestFragmentSpreadQuery$data = {|
  +EmptyCheckerTestFragment?: ?{|
    +$fragmentSpreads: EmptyCheckerTestFragment$fragmentType,
  |},
|};
export type EmptyCheckerTestFragmentSpreadQuery = {|
  response: EmptyCheckerTestFragmentSpreadQuery$data,
  variables: EmptyCheckerTestFragmentSpreadQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestFragmentSpreadQuery",
    "selections": [
      {
        "condition": "cond",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "EmptyCheckerTestFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "EmptyCheckerTestFragment"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestFragmentSpreadQuery",
    "selections": [
      {
        "condition": "cond",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "me",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "c6d65cfaa458e86f374902deece73f32",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestFragmentSpreadQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestFragmentSpreadQuery(\n  $cond: Boolean!\n) {\n  ...EmptyCheckerTestFragment @include(if: $cond)\n}\n\nfragment EmptyCheckerTestFragment on Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "80bd6f72005a2bb397a15486c90c6855";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestFragmentSpreadQuery$variables,
  EmptyCheckerTestFragmentSpreadQuery$data,
>*/);
