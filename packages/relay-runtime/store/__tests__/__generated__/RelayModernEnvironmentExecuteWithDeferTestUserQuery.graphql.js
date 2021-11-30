/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ed50c00b2ddc8ad86ac72baef06c0e0e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithDeferTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserQueryVariables = RelayModernEnvironmentExecuteWithDeferTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithDeferTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserQueryResponse = RelayModernEnvironmentExecuteWithDeferTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithDeferTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithDeferTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithDeferTestUserQuery$data,
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentExecuteWithDeferTestUserFragment"
              }
            ]
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserQuery",
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
          {
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentExecuteWithDeferTestUserQuery$defer$UserFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "filters": null,
                    "handle": "name_handler",
                    "key": "",
                    "kind": "ScalarHandle",
                    "name": "name"
                  }
                ],
                "type": "User",
                "abstractKey": null
              }
            ]
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f2528c801c26dc1779a1cac776d926d2",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithDeferTestUserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferTestUserQuery$defer$UserFragment\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f0274d924fe95386193769563e6421fc";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithDeferTestUserQuery$data,
>*/);
