/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<efe64d52250965b45b2102b099a20830>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { SomeDeeplyNestedFragment$fragmentType } from "./../some/deeply/nested/__generated__/SomeDeeplyNestedFragment.graphql";
export type NoInlineTestQuery$variables = {||};
export type NoInlineTestQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: SomeDeeplyNestedFragment$fragmentType,
  |},
|};
export type NoInlineTestQuery = {|
  response: NoInlineTestQuery$data,
  variables: NoInlineTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NoInlineTestQuery",
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
            "name": "SomeDeeplyNestedFragment"
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
    "name": "NoInlineTestQuery",
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
            "fragment": require('./../some/deeply/nested/__generated__/SomeDeeplyNestedFragment$normalization.graphql'),
            "kind": "FragmentSpread"
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
    "cacheID": "1aa8f46d9c2a927fd4ce48f54522951c",
    "id": null,
    "metadata": {},
    "name": "NoInlineTestQuery",
    "operationKind": "query",
    "text": "query NoInlineTestQuery {\n  me {\n    ...SomeDeeplyNestedFragment\n    id\n  }\n}\n\nfragment SomeDeeplyNestedFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "fa57c4e484cb80e9525446063eff8b64";
}

module.exports = ((node/*: any*/)/*: Query<
  NoInlineTestQuery$variables,
  NoInlineTestQuery$data,
>*/);
