/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<58301e9a423705297b62f45e0576ba08>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$ref = any;
export type RelayModernEnvironmentConditionalSelectionsTestConditionalQueryVariables = {|
  condition: boolean,
|};
export type RelayModernEnvironmentConditionalSelectionsTestConditionalQueryResponse = {|
  +$fragmentRefs: RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment$ref,
|};
export type RelayModernEnvironmentConditionalSelectionsTestConditionalQuery = {|
  variables: RelayModernEnvironmentConditionalSelectionsTestConditionalQueryVariables,
  response: RelayModernEnvironmentConditionalSelectionsTestConditionalQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "condition"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentConditionalSelectionsTestConditionalQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentConditionalSelectionsTestConditionalQuery",
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
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  (v1/*: any*/),
                  (v2/*: any*/)
                ],
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
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "40125132913bc8be01eaaa2ca44e5955",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentConditionalSelectionsTestConditionalQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentConditionalSelectionsTestConditionalQuery(\n  $condition: Boolean!\n) {\n  ...RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment\n}\n\nfragment RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment on Query {\n  viewer @include(if: $condition) {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n  me @skip(if: $condition) {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "15714f8d0ab41a192fe8a7946b71437f";
}

module.exports = node;
