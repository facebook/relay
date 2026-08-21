/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<17edc3dae3c4407f53405844c283b5b1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useQueryFromServerTestPlainQuery$variables = {};
export type useQueryFromServerTestPlainQuery$data = {
  readonly me: ?{
    readonly id: string,
    readonly name: ?string,
  },
};
export type useQueryFromServerTestPlainQuery = {
  response: useQueryFromServerTestPlainQuery$data,
  variables: useQueryFromServerTestPlainQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useQueryFromServerTestPlainQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useQueryFromServerTestPlainQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "6b98b18e4b58092aa2da2aa509a1e76f",
    "id": null,
    "metadata": {},
    "name": "useQueryFromServerTestPlainQuery",
    "operationKind": "query",
    "text": "query useQueryFromServerTestPlainQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "3271fe4c28fe22b993bb781ed76fb1a9";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useQueryFromServerTestPlainQuery$variables,
  useQueryFromServerTestPlainQuery$data,
>*/);
