/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7e299bfd8270bae61efbdcab2f748fd0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type ReactRelayQueryRendererTestNextQuery$variables = {|
  id: string,
|};
export type ReactRelayQueryRendererTestNextQueryVariables = ReactRelayQueryRendererTestNextQuery$variables;
export type ReactRelayQueryRendererTestNextQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type ReactRelayQueryRendererTestNextQueryResponse = ReactRelayQueryRendererTestNextQuery$data;
export type ReactRelayQueryRendererTestNextQuery = {|
  variables: ReactRelayQueryRendererTestNextQueryVariables,
  response: ReactRelayQueryRendererTestNextQuery$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayQueryRendererTestNextQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "ReactRelayQueryRendererTestNextQuery",
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
    "cacheID": "874cc8bdd051671801940705a3cfc1ef",
    "id": null,
    "metadata": {},
    "name": "ReactRelayQueryRendererTestNextQuery",
    "operationKind": "query",
    "text": "query ReactRelayQueryRendererTestNextQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2653367ac12aeab05ef739c0c9cf766f";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayQueryRendererTestNextQuery$variables,
  ReactRelayQueryRendererTestNextQuery$data,
>*/);
