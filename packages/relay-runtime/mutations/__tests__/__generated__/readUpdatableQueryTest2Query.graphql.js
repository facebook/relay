/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<88fe93c5b9a904ac7103fa3166ecc584>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { OpaqueScalarType } from "../OpaqueScalarType";
export type readUpdatableQueryTest2Query$variables = {||};
export type readUpdatableQueryTest2Query$data = {|
  +updatable_scalar_field: ?OpaqueScalarType,
|};
export type readUpdatableQueryTest2Query = {|
  response: readUpdatableQueryTest2Query$data,
  variables: readUpdatableQueryTest2Query$variables,
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
        "name": "updatable_scalar_field",
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
    "name": "readUpdatableQueryTest2Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryTest2Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "dd26ecea75e3561a6784a7144142c864",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryTest2Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "17153fb9c11380ca4682cb0bf6f90711";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  readUpdatableQueryTest2Query$variables,
  readUpdatableQueryTest2Query$data,
>*/);
