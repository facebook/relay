/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f65eabdd282621ef651ecd3311ce339>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import userGreetingResolver from "../../../../relay-test-utils-internal/relay-resolvers/UserGreeting.js";
export type RelayReaderResolverTest1QueryVariables = {||};
export type RelayReaderResolverTest1QueryResponse = {|
  +me: ?{|
    +greeting: $Call<typeof userGreetingResolver>,
  |},
|};
export type RelayReaderResolverTest1Query = {|
  variables: RelayReaderResolverTest1QueryVariables,
  response: RelayReaderResolverTest1QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest1Query",
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
    "name": "RelayReaderResolverTest1Query",
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
    "cacheID": "ae2ec139b6683ab99b8b240826038a6d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest1Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest1Query {\n  me {\n    ...UserGreeting\n    id\n  }\n}\n\nfragment UserGreeting on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "bdcddda7a9b9b6926a9fa0787d74a8f2";
}

module.exports = node;
