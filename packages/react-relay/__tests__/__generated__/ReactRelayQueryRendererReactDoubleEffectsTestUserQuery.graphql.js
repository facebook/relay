/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f92d382bfff8592fe9ed7fdce8b96318>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$variables = {|
  id: string,
|};
export type ReactRelayQueryRendererReactDoubleEffectsTestUserQueryVariables = ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$variables;
export type ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name?: ?string,
  |},
|};
export type ReactRelayQueryRendererReactDoubleEffectsTestUserQueryResponse = ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$data;
export type ReactRelayQueryRendererReactDoubleEffectsTestUserQuery = {|
  variables: ReactRelayQueryRendererReactDoubleEffectsTestUserQueryVariables,
  response: ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$data,
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
},
v3 = {
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
    "name": "ReactRelayQueryRendererReactDoubleEffectsTestUserQuery",
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
    "name": "ReactRelayQueryRendererReactDoubleEffectsTestUserQuery",
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
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "81dc23322845241135b3c51a111b25a8",
    "id": null,
    "metadata": {},
    "name": "ReactRelayQueryRendererReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayQueryRendererReactDoubleEffectsTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "66e1ca90a9f7c60c2256a44afed5f5cb";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$variables,
  ReactRelayQueryRendererReactDoubleEffectsTestUserQuery$data,
>*/);
