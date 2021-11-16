/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7447ec222966eedf893d8abb3d40beee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentCommitPayloadTestActorQuery$variables = {||};
export type RelayModernEnvironmentCommitPayloadTestActorQueryVariables = RelayModernEnvironmentCommitPayloadTestActorQuery$variables;
export type RelayModernEnvironmentCommitPayloadTestActorQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentCommitPayloadTestActorQueryResponse = RelayModernEnvironmentCommitPayloadTestActorQuery$data;
export type RelayModernEnvironmentCommitPayloadTestActorQuery = {|
  variables: RelayModernEnvironmentCommitPayloadTestActorQueryVariables,
  response: RelayModernEnvironmentCommitPayloadTestActorQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCommitPayloadTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "RelayModernEnvironmentCommitPayloadTestActorQuery",
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
    "cacheID": "929576ce99b7f36cf7fee848d741b92d",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCommitPayloadTestActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCommitPayloadTestActorQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7f92ebf6ec98bfacd4bbd941e09a0cc6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCommitPayloadTestActorQuery$variables,
  RelayModernEnvironmentCommitPayloadTestActorQuery$data,
>*/);
