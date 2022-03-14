/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d1f10c09169d07bd5ab47ad48237cb16>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$variables = {|
  fetchSize: boolean,
|};
export type RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$data = {|
  +me: ?{|
    +name: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery = {|
  response: RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$data,
  variables: RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "fetchSize"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "condition": "fetchSize",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 42
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": "profilePicture(size:42)"
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ea807cd2423f72a7953f43fe01bc4ad0",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery(\n  $fetchSize: Boolean!\n) {\n  me {\n    name\n    profilePicture(size: 42) @include(if: $fetchSize) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "850de1032d800f34d3684ba47d831f8d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$variables,
  RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery$data,
>*/);
