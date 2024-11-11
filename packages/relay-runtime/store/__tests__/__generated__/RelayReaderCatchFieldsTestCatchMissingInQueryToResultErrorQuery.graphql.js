/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<26736870d74b5df84afdef1f37960e39>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$data = Result<{|
  +me: ?{|
    +firstName: ?string,
  |},
|}, mixed>;
export type RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery = {|
  response: RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$data,
  variables: RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "catchTo": "RESULT"
    },
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery",
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery",
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
    "cacheID": "a874a13a9a19e6942e207b1644cc808c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "39451da031a48652f61de2e1e6fcdf54";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$variables,
  RelayReaderCatchFieldsTestCatchMissingInQueryToResultErrorQuery$data,
>*/);
