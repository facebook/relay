/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cc22bbfedd2073727418a1047e4f77f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentCommitPayloadTest4UserFragment$ref = any;
export type RelayModernEnvironmentCommitPayloadTest4ActorQueryVariables = {||};
export type RelayModernEnvironmentCommitPayloadTest4ActorQueryResponse = {|
  +me: ?{|
    +name: ?string,
    +$fragmentRefs: RelayModernEnvironmentCommitPayloadTest4UserFragment$ref,
  |},
|};
export type RelayModernEnvironmentCommitPayloadTest4ActorQuery = {|
  variables: RelayModernEnvironmentCommitPayloadTest4ActorQueryVariables,
  response: RelayModernEnvironmentCommitPayloadTest4ActorQueryResponse,
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
    "name": "RelayModernEnvironmentCommitPayloadTest4ActorQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentCommitPayloadTest4UserFragment"
              }
            ]
          }
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
    "name": "RelayModernEnvironmentCommitPayloadTest4ActorQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentCommitPayloadTest4ActorQuery$defer$RelayModernEnvironmentCommitPayloadTest4UserFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              }
            ]
          },
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
    "cacheID": "57271f60562edb814953caf06d97e88c",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCommitPayloadTest4ActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCommitPayloadTest4ActorQuery {\n  me {\n    name\n    ...RelayModernEnvironmentCommitPayloadTest4UserFragment @defer(label: \"RelayModernEnvironmentCommitPayloadTest4ActorQuery$defer$RelayModernEnvironmentCommitPayloadTest4UserFragment\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentCommitPayloadTest4UserFragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8f2ceead1f06c0a0a54557f7a9827a27";
}

module.exports = node;
