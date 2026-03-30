/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<18747f1f9904c0d297651f55425b9ce7>>
 * @flow
 * @lightSyntaxTransform
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
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentQueryCacheExpirationTimeTestQuery",
    "selections": (v0/*:: as any*/)
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
  (node/*:: as any*/).hash = "c59b6ace60293318ee12588cdd3e9ccc";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$variables,
  RelayModernEnvironmentQueryCacheExpirationTimeTestQuery$data,
>*/);
