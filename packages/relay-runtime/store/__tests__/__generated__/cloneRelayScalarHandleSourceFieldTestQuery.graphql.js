/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f720f4ffb7bbe6d2179e966619c2c9e7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type cloneRelayScalarHandleSourceFieldTestQuery$variables = {||};
export type cloneRelayScalarHandleSourceFieldTestQueryVariables = cloneRelayScalarHandleSourceFieldTestQuery$variables;
export type cloneRelayScalarHandleSourceFieldTestQuery$data = {|
  +me: ?{|
    +address: ?{|
      +street: ?string,
    |},
  |},
|};
export type cloneRelayScalarHandleSourceFieldTestQueryResponse = cloneRelayScalarHandleSourceFieldTestQuery$data;
export type cloneRelayScalarHandleSourceFieldTestQuery = {|
  variables: cloneRelayScalarHandleSourceFieldTestQueryVariables,
  response: cloneRelayScalarHandleSourceFieldTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "cloneRelayScalarHandleSourceFieldTestQuery",
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
            "concreteType": "StreetAddress",
            "kind": "LinkedField",
            "name": "address",
            "plural": false,
            "selections": [
              {
                "alias": "street",
                "args": null,
                "kind": "ScalarField",
                "name": "__street_test",
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "name": "cloneRelayScalarHandleSourceFieldTestQuery",
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
            "concreteType": "StreetAddress",
            "kind": "LinkedField",
            "name": "address",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "street",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "test",
                "key": "",
                "kind": "ScalarHandle",
                "name": "street"
              }
            ],
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
    "cacheID": "f4635baa0aca40e8a7a892820ddae8ec",
    "id": null,
    "metadata": {},
    "name": "cloneRelayScalarHandleSourceFieldTestQuery",
    "operationKind": "query",
    "text": "query cloneRelayScalarHandleSourceFieldTestQuery {\n  me {\n    address {\n      street\n    }\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "3550000f29a16d6c56f9ec8bd39e313c";
}

module.exports = ((node/*: any*/)/*: Query<
  cloneRelayScalarHandleSourceFieldTestQuery$variables,
  cloneRelayScalarHandleSourceFieldTestQuery$data,
>*/);
