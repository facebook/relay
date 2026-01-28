/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4c1777067aa429e10662cc112c195cea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { EmptyCheckerTestConditionalFragment$fragmentType } from "./EmptyCheckerTestConditionalFragment.graphql";
export type EmptyCheckerTestFragmentConditionalQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestFragmentConditionalQuery$data = {|
  +$fragmentSpreads: EmptyCheckerTestConditionalFragment$fragmentType,
|};
export type EmptyCheckerTestFragmentConditionalQuery = {|
  response: EmptyCheckerTestFragmentConditionalQuery$data,
  variables: EmptyCheckerTestFragmentConditionalQuery$variables,
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
    "name": "EmptyCheckerTestFragmentConditionalQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "cond",
            "variableName": "cond"
          }
        ],
        "kind": "FragmentSpread",
        "name": "EmptyCheckerTestConditionalFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestFragmentConditionalQuery",
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
    "cacheID": "bdb0679371f8a6bc1362f4968bc42962",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestFragmentConditionalQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestFragmentConditionalQuery(\n  $cond: Boolean!\n) {\n  ...EmptyCheckerTestConditionalFragment_yuQoQ\n}\n\nfragment EmptyCheckerTestConditionalFragment_yuQoQ on Query {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7cd10f617c9d7a917cf4418037dce6d0";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestFragmentConditionalQuery$variables,
  EmptyCheckerTestFragmentConditionalQuery$data,
>*/);
