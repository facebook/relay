/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<77b53b8250e5ba10d7067e9d62e70db0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$variables = {|
  id?: ?string,
|};
export type RelayMockEnvironmentWithComponentsTestFantasticEffortQueryVariables = RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$variables;
export type RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$data = {|
  +user: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestFantasticEffortQueryResponse = RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$data;
export type RelayMockEnvironmentWithComponentsTestFantasticEffortQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestFantasticEffortQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$data,
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
    "name": "RelayMockEnvironmentWithComponentsTestFantasticEffortQuery",
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
          (v3/*: any*/)
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
    "name": "RelayMockEnvironmentWithComponentsTestFantasticEffortQuery",
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
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d38637e1fd0f2b622a9be0ebc3a286dd",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestFantasticEffortQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestFantasticEffortQuery(\n  $id: ID = \"<default>\"\n) {\n  user: node(id: $id) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e2d36fb6f2a33dd6bde39f2ae9815f3a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$variables,
  RelayMockEnvironmentWithComponentsTestFantasticEffortQuery$data,
>*/);
