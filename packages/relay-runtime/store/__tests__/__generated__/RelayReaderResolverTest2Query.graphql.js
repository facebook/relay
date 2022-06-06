/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4d23e4a4c227810a45458ef63c1cd28e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type UserConstantDependentResolver$key = any;
import userConstantDependentResolver from "../resolvers/UserConstantDependentResolver.js";
// Type assertion validating that `userConstantDependentResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userConstantDependentResolver: (
  rootKey: UserConstantDependentResolver$key, 
) => mixed);
export type RelayReaderResolverTest2Query$variables = {||};
export type RelayReaderResolverTest2Query$data = {|
  +me: ?{|
    +constant_dependent: ?$Call<<R>((...empty[]) => R) => R, typeof userConstantDependentResolver>,
  |},
|};
export type RelayReaderResolverTest2Query = {|
  response: RelayReaderResolverTest2Query$data,
  variables: RelayReaderResolverTest2Query$variables,
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
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserConstantDependentResolver"
            },
            "kind": "RelayResolver",
            "name": "constant_dependent",
            "resolverModule": require('./../resolvers/UserConstantDependentResolver.js'),
            "path": "me.constant_dependent"
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
    "cacheID": "38545ed7d1b392b27e632a5e39c9441e",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest2Query {\n  me {\n    ...UserConstantDependentResolver\n    id\n  }\n}\n\nfragment UserConstantDependentResolver on User {\n  ...UserConstantResolver\n}\n\nfragment UserConstantResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "fd0c2d161f1a5237011571fb21fabd9c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest2Query$variables,
  RelayReaderResolverTest2Query$data,
>*/);
