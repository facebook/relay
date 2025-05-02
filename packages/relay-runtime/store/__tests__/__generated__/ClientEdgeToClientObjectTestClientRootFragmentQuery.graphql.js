/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9ee6298ab2ab61c14148a3dcad8bb88f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { ClientEdgeToClientObjectTestClientRootNameFragment$key } from "./ClientEdgeToClientObjectTestClientRootNameFragment.graphql";
import {account_name as clientAccountAccountNameResolverType} from "../ClientEdgeToClientObject-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `clientAccountAccountNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(clientAccountAccountNameResolverType: (
  rootKey: ClientEdgeToClientObjectTestClientRootNameFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {account as queryAccountResolverType} from "../ClientEdgeToClientObject-test.js";
// Type assertion validating that `queryAccountResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAccountResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ClientEdgeToClientObjectTestClientRootFragmentQuery$variables = {||};
export type ClientEdgeToClientObjectTestClientRootFragmentQuery$data = {|
  +account: ?{|
    +__id: string,
    +account_name: ?string,
    +id: ?string,
  |},
|};
export type ClientEdgeToClientObjectTestClientRootFragmentQuery = {|
  response: ClientEdgeToClientObjectTestClientRootFragmentQuery$data,
  variables: ClientEdgeToClientObjectTestClientRootFragmentQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__id",
  "storageKey": null
},
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
    "name": "ClientEdgeToClientObjectTestClientRootFragmentQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "ClientAccount",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "account",
          "resolverModule": require('../ClientEdgeToClientObject-test').account,
          "path": "account"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ClientAccount",
          "kind": "LinkedField",
          "name": "account",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ClientEdgeToClientObjectTestClientRootNameFragment"
              },
              "kind": "RelayResolver",
              "name": "account_name",
              "resolverModule": require('../ClientEdgeToClientObject-test').account_name,
              "path": "account.account_name"
            }
          ],
          "storageKey": null
        }
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClientEdgeToClientObjectTestClientRootFragmentQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "account",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ClientAccount",
          "kind": "LinkedField",
          "name": "account",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "name": "account_name",
              "args": null,
              "fragment": {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "name": "self",
                    "args": null,
                    "fragment": {
                      "kind": "InlineFragment",
                      "selections": [
                        (v1/*: any*/)
                      ],
                      "type": "ClientAccount",
                      "abstractKey": null
                    },
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": true
                  }
                ],
                "type": "ClientAccount",
                "abstractKey": null
              },
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            }
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "ffa6b940b1204ad6a4b1699197a63b1b",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeToClientObjectTestClientRootFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c9e60b20e5eac19fb837bd03824b4ff2";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ClientEdgeToClientObjectTestClientRootFragmentQuery$variables,
  ClientEdgeToClientObjectTestClientRootFragmentQuery$data,
>*/);
