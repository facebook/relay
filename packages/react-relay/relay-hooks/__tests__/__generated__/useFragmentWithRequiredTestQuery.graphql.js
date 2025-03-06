/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<15c3c6b4bed449af7f25913d945cc922>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentWithRequiredTestUserFragment$fragmentType } from "./useFragmentWithRequiredTestUserFragment.graphql";
export type useFragmentWithRequiredTestQuery$variables = {|
  id: string,
|};
export type useFragmentWithRequiredTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useFragmentWithRequiredTestUserFragment$fragmentType,
  |},
|};
export type useFragmentWithRequiredTestQuery = {|
  response: useFragmentWithRequiredTestQuery$data,
  variables: useFragmentWithRequiredTestQuery$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentWithRequiredTestQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useFragmentWithRequiredTestUserFragment"
              }
            ],
            "type": "User",
            "abstractKey": null
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
    "name": "useFragmentWithRequiredTestQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          },
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
  },
  "params": {
    "cacheID": "d92c3958e46586a5b24ead47bb7f2a33",
    "id": null,
    "metadata": {},
    "name": "useFragmentWithRequiredTestQuery",
    "operationKind": "query",
    "text": "query useFragmentWithRequiredTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      ...useFragmentWithRequiredTestUserFragment\n    }\n    id\n  }\n}\n\nfragment useFragmentWithRequiredTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "13a5758b6ca5410f0169950b83543b47";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentWithRequiredTestQuery$variables,
  useFragmentWithRequiredTestQuery$data,
>*/);
