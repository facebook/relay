/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c9f511d2b0ad61e1c82d0c0a89feeb43>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type readUpdatableQueryTestMissingFieldsQuery$variables = {||};
export type readUpdatableQueryTestMissingFieldsQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type readUpdatableQueryTestMissingFieldsQuery = {|
  response: readUpdatableQueryTestMissingFieldsQuery$data,
  variables: readUpdatableQueryTestMissingFieldsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTestMissingFieldsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "readUpdatableQueryTestMissingFieldsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "20dc54c7abef5a35eb7d46f05a362332",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryTestMissingFieldsQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryTestMissingFieldsQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9de93271e8eefca4bd47df351b30ec10";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryTestMissingFieldsQuery$variables,
  readUpdatableQueryTestMissingFieldsQuery$data,
>*/);
