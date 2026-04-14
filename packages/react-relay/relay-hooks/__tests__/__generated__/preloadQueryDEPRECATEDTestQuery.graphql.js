/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<53cc4387c9cad881792557a596c027c4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type preloadQueryDEPRECATEDTestQuery$variables = {|
  id: string,
|};
export type preloadQueryDEPRECATEDTestQuery$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type preloadQueryDEPRECATEDTestQuery = {|
  response: preloadQueryDEPRECATEDTestQuery$data,
  variables: preloadQueryDEPRECATEDTestQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "preloadQueryDEPRECATEDTestQuery",
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
    "name": "preloadQueryDEPRECATEDTestQuery",
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
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5ecd40e991a0d8b158421c73ce78c6ef",
    "id": null,
    "metadata": {},
    "name": "preloadQueryDEPRECATEDTestQuery",
    "operationKind": "query",
    "text": "query preloadQueryDEPRECATEDTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f41beb5f28919c6ec7dc474f4322b737";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  preloadQueryDEPRECATEDTestQuery$variables,
  preloadQueryDEPRECATEDTestQuery$data,
>*/);
