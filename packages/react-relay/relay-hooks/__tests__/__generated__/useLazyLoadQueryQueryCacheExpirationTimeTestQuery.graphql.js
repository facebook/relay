/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3f685baaee25bec1486ec7ad50e8fd65>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useLazyLoadQueryQueryCacheExpirationTimeTestQuery$variables = {||};
export type useLazyLoadQueryQueryCacheExpirationTimeTestQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type useLazyLoadQueryQueryCacheExpirationTimeTestQuery = {|
  response: useLazyLoadQueryQueryCacheExpirationTimeTestQuery$data,
  variables: useLazyLoadQueryQueryCacheExpirationTimeTestQuery$variables,
|};
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
    "name": "useLazyLoadQueryQueryCacheExpirationTimeTestQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useLazyLoadQueryQueryCacheExpirationTimeTestQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d2703389c91278aacb3dba085cac3260",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryQueryCacheExpirationTimeTestQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryQueryCacheExpirationTimeTestQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bc4f616133288fcfce806fe9d159b8a1";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryQueryCacheExpirationTimeTestQuery$variables,
  useLazyLoadQueryQueryCacheExpirationTimeTestQuery$data,
>*/);
