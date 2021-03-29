/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d235160ff70e9a95d27a4205b4ab2c5c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref = any;
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQueryVariables = {|
  id?: ?string,
|};
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQueryResponse = {|
  +user: ?{|
    +id: string,
    +name: ?string,
    +hometown: ?{|
      +$fragmentRefs: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref,
    |},
  |},
|};
export type RelayMockEnvironmentWithComponentsTestExceptionalImpactQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestExceptionalImpactQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestExceptionalImpactQueryResponse,
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

module.exports = node;
