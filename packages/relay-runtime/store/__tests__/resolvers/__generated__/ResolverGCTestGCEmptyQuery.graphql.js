/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c9ce36f542a0fbdda458329edd2f2724>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
export type ResolverGCTestGCEmptyQuery$variables = {||};
export type ResolverGCTestGCEmptyQuery$data = {|
  +__id: string,
|};
export type ResolverGCTestGCEmptyQuery = {|
  response: ResolverGCTestGCEmptyQuery$data,
  variables: ResolverGCTestGCEmptyQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "ClientExtension",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__id",
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverGCTestGCEmptyQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResolverGCTestGCEmptyQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "4441972ffdfbbb6e70d96d2e7f2acd6e",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestGCEmptyQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "ab6e960e9de528ba22d3d893f64409b3";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  ResolverGCTestGCEmptyQuery$variables,
  ResolverGCTestGCEmptyQuery$data,
>*/);
