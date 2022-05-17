/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4db3103f99bdfae17a072be5e26f776>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ResolverTest2Fragment$fragmentType = any;
export type ResolverTest2Query$variables = {||};
export type ResolverTest2Query$data = {|
  +me: ?{|
    +$fragmentSpreads: ResolverTest2Fragment$fragmentType,
  |},
|};
export type ResolverTest2Query = {|
  response: ResolverTest2Query$data,
  variables: ResolverTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverTest2Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "ResolverTest2Fragment"
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
    "name": "ResolverTest2Query",
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
    "cacheID": "d73d34afe90c0359a2f786d2ef310a57",
    "id": null,
    "metadata": {},
    "name": "ResolverTest2Query",
    "operationKind": "query",
    "text": "query ResolverTest2Query {\n  me {\n    ...ResolverTest2Fragment\n    id\n  }\n}\n\nfragment DummyUserGreetingResolver on User {\n  name\n}\n\nfragment ResolverTest2Fragment on User {\n  ...DummyUserGreetingResolver\n  id\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "97fdcfc376d0de732dc11aeac9107841";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverTest2Query$variables,
  ResolverTest2Query$data,
>*/);
