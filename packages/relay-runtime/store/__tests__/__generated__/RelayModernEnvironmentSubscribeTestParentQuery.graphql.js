/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<297aead4b2ccf7dea418e1100ccb069b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentSubscribeTestParentQuery$variables = {||};
export type RelayModernEnvironmentSubscribeTestParentQueryVariables = RelayModernEnvironmentSubscribeTestParentQuery$variables;
export type RelayModernEnvironmentSubscribeTestParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentSubscribeTestParentQueryResponse = RelayModernEnvironmentSubscribeTestParentQuery$data;
export type RelayModernEnvironmentSubscribeTestParentQuery = {|
  variables: RelayModernEnvironmentSubscribeTestParentQueryVariables,
  response: RelayModernEnvironmentSubscribeTestParentQuery$data,
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
    "name": "RelayModernEnvironmentSubscribeTestParentQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentSubscribeTestParentQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "3c6a4f8ea29c885ac4073e9430c4c8dd",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentSubscribeTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentSubscribeTestParentQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "05d4bca13d0af57cb676421347016c3e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentSubscribeTestParentQuery$variables,
  RelayModernEnvironmentSubscribeTestParentQuery$data,
>*/);
