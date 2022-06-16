/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f17c10cca2de0d8553d79691eaf2505f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
export type readUpdatableQueryEXPERIMENTALTest2Query$variables = {||};
export type readUpdatableQueryEXPERIMENTALTest2Query$data = {|
  +updatable_scalar_field: ?any,
|};
export type readUpdatableQueryEXPERIMENTALTest2Query = {|
  response: readUpdatableQueryEXPERIMENTALTest2Query$data,
  variables: readUpdatableQueryEXPERIMENTALTest2Query$variables,
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
    "name": "readUpdatableQueryEXPERIMENTALTest2Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryEXPERIMENTALTest2Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "20dce9c8e494595d2a6c2c0708b45a9b",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTest2Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c0277f7ea53774f1ffa8f57b9e0b35a1";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  readUpdatableQueryEXPERIMENTALTest2Query$variables,
  readUpdatableQueryEXPERIMENTALTest2Query$data,
>*/);
