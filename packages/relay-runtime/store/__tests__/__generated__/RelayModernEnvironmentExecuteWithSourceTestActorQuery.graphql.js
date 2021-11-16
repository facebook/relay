/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ab64eae736c1d5ddbe20b856d27f39d7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithSourceTestActorQuery$variables = {|
  fetchSize: boolean,
|};
export type RelayModernEnvironmentExecuteWithSourceTestActorQueryVariables = RelayModernEnvironmentExecuteWithSourceTestActorQuery$variables;
export type RelayModernEnvironmentExecuteWithSourceTestActorQuery$data = {|
  +me: ?{|
    +name: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithSourceTestActorQueryResponse = RelayModernEnvironmentExecuteWithSourceTestActorQuery$data;
export type RelayModernEnvironmentExecuteWithSourceTestActorQuery = {|
  variables: RelayModernEnvironmentExecuteWithSourceTestActorQueryVariables,
  response: RelayModernEnvironmentExecuteWithSourceTestActorQuery$data,
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
    "name": "RelayModernEnvironmentExecuteWithSourceTestActorQuery",
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
    "name": "RelayModernEnvironmentExecuteWithSourceTestActorQuery",
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
    "cacheID": "74c4d7326947f3612536eacad9ebd432",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithSourceTestActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithSourceTestActorQuery(\n  $fetchSize: Boolean!\n) {\n  me {\n    name\n    profilePicture(size: 42) @include(if: $fetchSize) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "78fb2c73be5cfff78fc5749a4e9bbbdf";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithSourceTestActorQuery$variables,
  RelayModernEnvironmentExecuteWithSourceTestActorQuery$data,
>*/);
