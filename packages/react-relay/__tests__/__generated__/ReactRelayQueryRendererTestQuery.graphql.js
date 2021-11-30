/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e2cbf57a25126999e853ae46694f331b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayQueryRendererTestFragment$fragmentType = any;
export type ReactRelayQueryRendererTestQuery$variables = {|
  id?: ?string,
|};
export type ReactRelayQueryRendererTestQueryVariables = ReactRelayQueryRendererTestQuery$variables;
export type ReactRelayQueryRendererTestQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: ReactRelayQueryRendererTestFragment$fragmentType,
  |},
|};
export type ReactRelayQueryRendererTestQueryResponse = ReactRelayQueryRendererTestQuery$data;
export type ReactRelayQueryRendererTestQuery = {|
  variables: ReactRelayQueryRendererTestQueryVariables,
  response: ReactRelayQueryRendererTestQuery$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayQueryRendererTestQuery",
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
            "name": "ReactRelayQueryRendererTestFragment"
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
    "name": "ReactRelayQueryRendererTestQuery",
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
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "837570261d96469997712138baea6823",
    "id": null,
    "metadata": {},
    "name": "ReactRelayQueryRendererTestQuery",
    "operationKind": "query",
    "text": "query ReactRelayQueryRendererTestQuery(\n  $id: ID = \"<default>\"\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...ReactRelayQueryRendererTestFragment\n  }\n}\n\nfragment ReactRelayQueryRendererTestFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "868a762b987be24c755ff000a86baacc";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayQueryRendererTestQuery$variables,
  ReactRelayQueryRendererTestQuery$data,
>*/);
