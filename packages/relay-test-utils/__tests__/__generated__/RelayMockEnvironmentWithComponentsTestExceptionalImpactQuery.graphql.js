/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<97f8dcac130ba35d678ae455de6d5614>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType } from "./RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment.graphql";
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$variables = {|
  id?: ?string,
|};
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$data = {|
  +user: ?{|
    +hometown: ?{|
      +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
    |},
    +id: string,
    +name: ?string,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery = {|
  response: RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$data,
  variables: RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": "<default>",
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Page",
            "kind": "LinkedField",
            "name": "hometown",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment"
              }
            ],
            "storageKey": null
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
    "name": "RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery",
    "selections": [
      {
        "alias": "user",
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
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Page",
            "kind": "LinkedField",
            "name": "hometown",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "websites",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0ba85ab7490d3ff236344eec64770511",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery(\n  $id: ID = \"<default>\"\n) {\n  user: node(id: $id) {\n    __typename\n    id\n    name\n    hometown {\n      ...RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment\n      id\n    }\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment on Page {\n  id\n  name\n  websites\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "798cb3a725408866a34e49c9e720775f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$variables,
  RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery$data,
>*/);
