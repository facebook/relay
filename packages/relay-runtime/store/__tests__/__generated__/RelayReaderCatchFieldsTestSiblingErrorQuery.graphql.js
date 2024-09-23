/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cc9e5e228bc2c71f72d814418061eb35>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestSiblingErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestSiblingErrorQuery$data = {|
  +me: ?{|
    +firstName: Result<?string, $ReadOnlyArray<mixed>>,
    +lastName: ?string,
  |},
|};
export type RelayReaderCatchFieldsTestSiblingErrorQuery = {|
  response: RelayReaderCatchFieldsTestSiblingErrorQuery$data,
  variables: RelayReaderCatchFieldsTestSiblingErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
},
v1 = {
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
    "metadata": null,
    "name": "RelayReaderCatchFieldsTestSiblingErrorQuery",
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
            "kind": "CatchField",
            "field": (v1/*: any*/),
            "to": "RESULT",
            "path": "me.firstName"
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
    "name": "RelayReaderCatchFieldsTestSiblingErrorQuery",
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
          (v1/*: any*/),
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
    "cacheID": "c4ef23c580209bbde2ba7598bdf4bf05",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestSiblingErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestSiblingErrorQuery {\n  me {\n    lastName\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ea27f25406b67900cda195af7c54fdf5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestSiblingErrorQuery$variables,
  RelayReaderCatchFieldsTestSiblingErrorQuery$data,
>*/);
