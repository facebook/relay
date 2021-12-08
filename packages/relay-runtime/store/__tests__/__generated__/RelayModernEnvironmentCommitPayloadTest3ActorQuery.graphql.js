/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c51cce77b133a28ad974a8458e30adda>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentCommitPayloadTest3ActorQuery$variables = {||};
export type RelayModernEnvironmentCommitPayloadTest3ActorQueryVariables = RelayModernEnvironmentCommitPayloadTest3ActorQuery$variables;
export type RelayModernEnvironmentCommitPayloadTest3ActorQuery$data = {|
  +me: ?{|
    +name: ?string,
    +birthdate: ?{|
      +day: ?number,
      +month: ?number,
      +year: ?number,
    |},
  |},
|};
export type RelayModernEnvironmentCommitPayloadTest3ActorQueryResponse = RelayModernEnvironmentCommitPayloadTest3ActorQuery$data;
export type RelayModernEnvironmentCommitPayloadTest3ActorQuery = {|
  variables: RelayModernEnvironmentCommitPayloadTest3ActorQueryVariables,
  response: RelayModernEnvironmentCommitPayloadTest3ActorQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "Date",
  "kind": "LinkedField",
  "name": "birthdate",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "day",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "month",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "year",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCommitPayloadTest3ActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentCommitPayloadTest3ActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
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
    "cacheID": "cb135650dd368c98357ba362729df751",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCommitPayloadTest3ActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCommitPayloadTest3ActorQuery {\n  me {\n    name\n    birthdate {\n      day\n      month\n      year\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ca4be830837a3decc7fc7cb619969da9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCommitPayloadTest3ActorQuery$variables,
  RelayModernEnvironmentCommitPayloadTest3ActorQuery$data,
>*/);
