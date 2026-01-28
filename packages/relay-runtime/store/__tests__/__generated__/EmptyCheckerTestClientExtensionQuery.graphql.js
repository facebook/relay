/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4b4e8d34cd75080557b465f546538f83>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
export type EmptyCheckerTestClientExtensionQuery$variables = {||};
export type EmptyCheckerTestClientExtensionQuery$data = {|
  +client_root_field: ?string,
|};
export type EmptyCheckerTestClientExtensionQuery = {|
  response: EmptyCheckerTestClientExtensionQuery$data,
  variables: EmptyCheckerTestClientExtensionQuery$variables,
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
    "name": "EmptyCheckerTestClientExtensionQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "EmptyCheckerTestClientExtensionQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "7beee097571346d0b60f803416de3c02",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestClientExtensionQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "856ddc91ffbadbd0aa65b845b67b6cfb";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  EmptyCheckerTestClientExtensionQuery$variables,
  EmptyCheckerTestClientExtensionQuery$data,
>*/);
