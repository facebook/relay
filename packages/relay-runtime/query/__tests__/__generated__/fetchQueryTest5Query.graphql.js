/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<010ba7881fc16a868604923b3fd73862>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
export type fetchQueryTest5Query$variables = {||};
export type fetchQueryTest5Query$data = {|
  +client_root_field: ?string,
|};
export type fetchQueryTest5Query = {|
  response: fetchQueryTest5Query$data,
  variables: fetchQueryTest5Query$variables,
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
        "name": "client_root_field",
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
    "name": "fetchQueryTest5Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "fetchQueryTest5Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "1f64dc5de41e4d35c974cef1681434a4",
    "id": null,
    "metadata": {},
    "name": "fetchQueryTest5Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "51b5507fd390b89ad93a513e19352913";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  fetchQueryTest5Query$variables,
  fetchQueryTest5Query$data,
>*/);
