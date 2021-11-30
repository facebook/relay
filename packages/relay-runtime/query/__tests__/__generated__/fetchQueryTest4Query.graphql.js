/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a88bfc67011e48c38773231cd5beb7fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type fetchQueryTestFragment$fragmentType = any;
export type fetchQueryTest4Query$variables = {||};
export type fetchQueryTest4QueryVariables = fetchQueryTest4Query$variables;
export type fetchQueryTest4Query$data = {|
  +me: ?{|
    +$fragmentSpreads: fetchQueryTestFragment$fragmentType,
  |},
|};
export type fetchQueryTest4QueryResponse = fetchQueryTest4Query$data;
export type fetchQueryTest4Query = {|
  variables: fetchQueryTest4QueryVariables,
  response: fetchQueryTest4Query$data,
|};
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
  (node/*: any*/).hash = "2d32d8bff15f15e3d765d8c6160edecf";
}

module.exports = ((node/*: any*/)/*: Query<
  fetchQueryTest4Query$variables,
  fetchQueryTest4Query$data,
>*/);
