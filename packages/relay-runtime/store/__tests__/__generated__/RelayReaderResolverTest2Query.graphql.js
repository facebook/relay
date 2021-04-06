/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1224c0f84832dca1fa9d35913fb4bf84>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import type { ResolvedValueType as UserGreetingResolverReturnType } from "../../../../relay-test-utils-internal/relay-resolvers/UserGreeting.js";
export type RelayReaderResolverTest2QueryVariables = {||};
export type RelayReaderResolverTest2QueryResponse = {|
  +me: ?{|
    +greeting: UserGreetingResolverReturnType,
  |},
|};
export type RelayReaderResolverTest2Query = {|
  variables: RelayReaderResolverTest2QueryVariables,
  response: RelayReaderResolverTest2QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest2Query",
    "selections": [
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
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserGreeting"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('./../../../../relay-test-utils-internal/relay-resolvers/UserGreeting.js')
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
    "name": "RelayReaderResolverTest2Query",
    "selections": [
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
            "name": "name",
            "storageKey": null
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
    "cacheID": "300294a315d742d16ba41899dfe6e8e3",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest2Query {\n  me {\n    ...UserGreeting\n    id\n  }\n}\n\nfragment UserGreeting on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "97a73e89bf2a408ad6fb173669b1a765";
}

module.exports = node;
