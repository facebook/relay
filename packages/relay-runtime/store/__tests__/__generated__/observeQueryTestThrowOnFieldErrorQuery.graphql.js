/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4def5f761d617b4eba0fe481b0871928>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestThrowOnFieldErrorQuery$variables = {||};
export type observeQueryTestThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type observeQueryTestThrowOnFieldErrorQuery = {|
  response: observeQueryTestThrowOnFieldErrorQuery$data,
  variables: observeQueryTestThrowOnFieldErrorQuery$variables,
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
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "observeQueryTestThrowOnFieldErrorQuery",
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
    "name": "observeQueryTestThrowOnFieldErrorQuery",
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
    "cacheID": "2bed926674a95b10fc3581d217d73493",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeQueryTestThrowOnFieldErrorQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4e57fcb1ba72674139f2450c6bfda49a";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestThrowOnFieldErrorQuery$variables,
  observeQueryTestThrowOnFieldErrorQuery$data,
>*/);
