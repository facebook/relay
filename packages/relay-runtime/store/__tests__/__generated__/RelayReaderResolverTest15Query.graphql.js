/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<088055ab58f999bdd940c32cf328da7d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type UndefinedFieldResolver$key = any;
import queryUndefinedFieldResolver from "../resolvers/UndefinedFieldResolver.js";
// Type assertion validating that `queryUndefinedFieldResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryUndefinedFieldResolver: (
  rootKey: UndefinedFieldResolver$key, 
) => mixed);
export type RelayReaderResolverTest15Query$variables = {||};
export type RelayReaderResolverTest15Query$data = {|
  +undefined_field: ?$Call<<R>((...empty[]) => R) => R, typeof queryUndefinedFieldResolver>,
|};
export type RelayReaderResolverTest15Query = {|
  response: RelayReaderResolverTest15Query$data,
  variables: RelayReaderResolverTest15Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest15Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "UndefinedFieldResolver"
        },
        "kind": "RelayResolver",
        "name": "undefined_field",
        "resolverModule": require('./../resolvers/UndefinedFieldResolver.js'),
        "path": "undefined_field"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderResolverTest15Query",
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
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__id",
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
    "cacheID": "da701d4263134688ebb77fb17fd71077",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest15Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest15Query {\n  ...UndefinedFieldResolver\n}\n\nfragment UndefinedFieldResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "83f7dab79388f0374614e2ab5d69c2e6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest15Query$variables,
  RelayReaderResolverTest15Query$data,
>*/);
