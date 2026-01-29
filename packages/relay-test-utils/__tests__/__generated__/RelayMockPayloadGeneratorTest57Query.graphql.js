/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47f76140deeacf45ee24386e211a2d9b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserNamePassthroughResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/UserNamePassthroughResolver.graphql";
import {name_passthrough as userNamePassthroughResolverType} from "../../../relay-runtime/store/__tests__/resolvers/UserNamePassthroughResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userNamePassthroughResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userNamePassthroughResolverType: (
  rootKey: UserNamePassthroughResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayMockPayloadGeneratorTest57Query$variables = {||};
export type RelayMockPayloadGeneratorTest57Query$data = {|
  +me: ?{|
    +name_passthrough: ?string,
  |},
|};
export type RelayMockPayloadGeneratorTest57Query = {|
  response: RelayMockPayloadGeneratorTest57Query$data,
  variables: RelayMockPayloadGeneratorTest57Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest57Query",
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
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserNamePassthroughResolver"
            },
            "kind": "RelayResolver",
            "name": "name_passthrough",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/UserNamePassthroughResolver').name_passthrough,
            "path": "me.name_passthrough"
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
    "name": "RelayMockPayloadGeneratorTest57Query",
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
            "name": "name_passthrough",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
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
    "cacheID": "a872cdaa88feaf076679b4d9137183d3",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "me": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "me.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "me.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "RelayMockPayloadGeneratorTest57Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest57Query {\n  me {\n    ...UserNamePassthroughResolver\n    id\n  }\n}\n\nfragment UserNamePassthroughResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "6d62f875a372c1076a33a60494cd44dd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest57Query$variables,
  RelayMockPayloadGeneratorTest57Query$data,
>*/);
