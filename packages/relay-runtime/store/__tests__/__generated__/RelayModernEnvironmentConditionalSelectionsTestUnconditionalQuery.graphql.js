/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<01fa3da66f3efbf3bba2f2e9f9c5200e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$fragmentType = any;
export type RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$variables = {||};
export type RelayModernEnvironmentConditionalSelectionsTestUnconditionalQueryVariables = RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$variables;
export type RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$data = {|
  +$fragmentSpreads: RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$fragmentType,
|};
export type RelayModernEnvironmentConditionalSelectionsTestUnconditionalQueryResponse = RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$data;
export type RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery = {|
  variables: RelayModernEnvironmentConditionalSelectionsTestUnconditionalQueryVariables,
  response: RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery",
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
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "89bd5c6f3441ea4f07fe798a15220e89",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery {\n  ...RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment\n}\n\nfragment RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment on Query {\n  viewer {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3c52fbe71844689c6c28f33c6ff75a9d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$variables,
  RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery$data,
>*/);
