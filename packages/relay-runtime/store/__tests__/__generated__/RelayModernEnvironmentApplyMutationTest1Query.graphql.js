/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5e53c32858eccae69ade9a819f008e12>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentApplyMutationTestFragment$fragmentType = any;
export type RelayModernEnvironmentApplyMutationTest1Query$variables = {|
  id: string,
|};
export type RelayModernEnvironmentApplyMutationTest1QueryVariables = RelayModernEnvironmentApplyMutationTest1Query$variables;
export type RelayModernEnvironmentApplyMutationTest1Query$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentApplyMutationTest1QueryResponse = RelayModernEnvironmentApplyMutationTest1Query$data;
export type RelayModernEnvironmentApplyMutationTest1Query = {|
  variables: RelayModernEnvironmentApplyMutationTest1QueryVariables,
  response: RelayModernEnvironmentApplyMutationTest1Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
    "name": "RelayModernEnvironmentApplyMutationTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentApplyMutationTestFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentApplyMutationTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5802bc735f64ffcad8ece3012c220d7d",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentApplyMutationTest1Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentApplyMutationTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentApplyMutationTestFragment\n  }\n}\n\nfragment RelayModernEnvironmentApplyMutationTestFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cae70132f7b7d25f52ad8f7c8aa563f2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentApplyMutationTest1Query$variables,
  RelayModernEnvironmentApplyMutationTest1Query$data,
>*/);
