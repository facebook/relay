/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<06d208dfc7ce2f0aff3d4e69d1e9c8f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTest00Query$variables = {||};
export type RelayReaderCatchFieldsTest00Query$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderCatchFieldsTest00Query = {|
  response: RelayReaderCatchFieldsTest00Query$data,
  variables: RelayReaderCatchFieldsTest00Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderCatchFieldsTest00Query",
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
            "kind": "CatchField",
            "field": (v0/*: any*/),
            "to": "NULL"
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
    "name": "RelayReaderCatchFieldsTest00Query",
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
    "cacheID": "5b796da6b1f6fd63694c8c74f5089529",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest00Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest00Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "655bf830107b61d7b4ea2e3838fb9555";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest00Query$variables,
  RelayReaderCatchFieldsTest00Query$data,
>*/);
