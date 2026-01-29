/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<81328793e4ce977c4dae9ca02a525bdb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$data = ?{|
  +me: ?{|
    +firstName: ?string,
  |},
|};
export type RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery = {|
  response: RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$data,
  variables: RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$variables,
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
      "catchTo": "NULL"
    },
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery",
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery",
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
    "cacheID": "a11d394e39829f7d8404d58bb915dd81",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ffbbd346097bf22b57550c6bea489807";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$variables,
  RelayReaderCatchFieldsTestCatchMissingInQueryToNullErrorQuery$data,
>*/);
