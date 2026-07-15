/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ca1c00f3fdf0f658a805f93b745deab3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { fetchQueryTestFragment$fragmentType } from "./fetchQueryTestFragment.graphql";
export type fetchQueryTest4Query$variables = {};
export type fetchQueryTest4Query$data = {
  readonly me: ?{
    readonly $fragmentSpreads: fetchQueryTestFragment$fragmentType,
  },
};
export type fetchQueryTest4Query = {
  response: fetchQueryTest4Query$data,
  variables: fetchQueryTest4Query$variables,
};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "fetchQueryTest4Query",
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
            "name": "fetchQueryTestFragment"
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
    "name": "fetchQueryTest4Query",
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
    "cacheID": "403c7d581ecaec8971236097f9cd0abd",
    "id": null,
    "metadata": {},
    "name": "fetchQueryTest4Query",
    "operationKind": "query",
    "text": "query fetchQueryTest4Query {\n  me {\n    ...fetchQueryTestFragment\n    id\n  }\n}\n\nfragment fetchQueryTestFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "2d32d8bff15f15e3d765d8c6160edecf";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  fetchQueryTest4Query$variables,
  fetchQueryTest4Query$data,
>*/);
