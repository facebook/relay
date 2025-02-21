/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<640d3b690af15282d859679fdde281e6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayQueryRendererTestFragment$fragmentType } from "./ReactRelayQueryRendererTestFragment.graphql";
export type ReactRelayQueryRendererTestQuery$variables = {|
  id?: ?string,
|};
export type ReactRelayQueryRendererTestQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: ReactRelayQueryRendererTestFragment$fragmentType,
  |},
|};
export type ReactRelayQueryRendererTestQuery = {|
  response: ReactRelayQueryRendererTestQuery$data,
  variables: ReactRelayQueryRendererTestQuery$variables,
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
  (node/*: any*/).hash = "9fa9b4608e79feda0a43038cfc0fa816";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayQueryRendererTestQuery$variables,
  ReactRelayQueryRendererTestQuery$data,
>*/);
