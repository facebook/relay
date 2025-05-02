/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e24350d4653f30adb8ee0b44e68117c1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserClientEdgeResolver$key } from "./../resolvers/__generated__/UserClientEdgeResolver.graphql";
import {client_edge as userClientEdgeResolverType} from "../resolvers/UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayReaderClientEdgesTest5Query$variables = {||};
export type RelayReaderClientEdgesTest5Query$data = {|
  +me: ?{|
    +client_extension_linked_field: ?{|
      +client_edge: ?{|
        +name: ?string,
      |},
    |},
  |},
|};
export type RelayReaderClientEdgesTest5Query = {|
  response: RelayReaderClientEdgesTest5Query$data,
  variables: RelayReaderClientEdgesTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderClientEdgesTest5Query",
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
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "client_extension_linked_field",
                "plural": false,
                "selections": [
                  {
                    "kind": "ClientEdgeToServerObject",
                    "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest5Query_me__client_extension_linked_field__client_edge.graphql'),
                    "backingField": {
                      "alias": null,
                      "args": null,
                      "fragment": {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "UserClientEdgeResolver"
                      },
                      "kind": "RelayResolver",
                      "name": "client_edge",
                      "resolverModule": require('../resolvers/UserClientEdgeResolver').client_edge,
                      "path": "me.client_extension_linked_field.client_edge"
                    },
                    "linkedField": {
                      "alias": null,
                      "args": null,
                      "concreteType": "User",
                      "kind": "LinkedField",
                      "name": "client_edge",
                      "plural": false,
                      "selections": (v0/*: any*/),
                      "storageKey": null
                    }
                  }
                ],
                "storageKey": null
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
    "name": "RelayReaderClientEdgesTest5Query",
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
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "client_extension_linked_field",
                "plural": false,
                "selections": [
                  {
                    "name": "client_edge",
                    "args": null,
                    "fragment": {
                      "kind": "InlineFragment",
                      "selections": (v0/*: any*/),
                      "type": "User",
                      "abstractKey": null
                    },
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": false
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4ec141eca46e46309b64990ecdb9d9df",
    "id": null,
    "metadata": {},
    "name": "RelayReaderClientEdgesTest5Query",
    "operationKind": "query",
    "text": "query RelayReaderClientEdgesTest5Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9b811ee5e147084d125230990142a40e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderClientEdgesTest5Query$variables,
  RelayReaderClientEdgesTest5Query$data,
>*/);
