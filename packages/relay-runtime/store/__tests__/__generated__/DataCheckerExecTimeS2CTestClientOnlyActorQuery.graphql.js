/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84276fdf1dcc89a33a97708341d8b0a1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type DataCheckerExecTimeS2CTestClientOnlyActorQuery$variables = {
  id: string,
};
export type DataCheckerExecTimeS2CTestClientOnlyActorQuery$data = {
  readonly node: ?{
    readonly client_actor_field?: ?string,
  },
};
export type DataCheckerExecTimeS2CTestClientOnlyActorQuery = {
  response: DataCheckerExecTimeS2CTestClientOnlyActorQuery$data,
  variables: DataCheckerExecTimeS2CTestClientOnlyActorQuery$variables,
};
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
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "client_actor_field",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerExecTimeS2CTestClientOnlyActorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "DataCheckerExecTimeS2CTestClientOnlyActorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/),
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
    "cacheID": "5dce47cccb4686096fddbf3bdc6bdb0b",
    "id": null,
    "metadata": {},
    "name": "DataCheckerExecTimeS2CTestClientOnlyActorQuery",
    "operationKind": "query",
    "text": "query DataCheckerExecTimeS2CTestClientOnlyActorQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "31109a18296e63133ff02a69efd23629";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  DataCheckerExecTimeS2CTestClientOnlyActorQuery$variables,
  DataCheckerExecTimeS2CTestClientOnlyActorQuery$data,
>*/);
