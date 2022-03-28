/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<95d74b8695d4837b5d94afcfd64acf2c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$variables = {||};
export type RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentQueryCacheExpirationTimeTestQuery = {|
  response: RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$data,
  variables: RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$variables,
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
    "name": "RelayModernEnvironmentQueryCacheExpirationTimeTestQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentQueryCacheExpirationTimeTestQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "aecaf6712b0191841862dc1081bc376e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentQueryCacheExpirationTimeTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentQueryCacheExpirationTimeTestQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c59b6ace60293318ee12588cdd3e9ccc";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$variables,
  RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$data,
>*/);
