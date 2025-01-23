/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3ea2543ddff7963fe1c2bb18e548c009>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderRequiredFieldsTest4Fragment$fragmentType } from "./RelayReaderRequiredFieldsTest4Fragment.graphql";
export type RelayReaderRequiredFieldsTest22Query$variables = {||};
export type RelayReaderRequiredFieldsTest22Query$data = ?{|
  +me: {|
    +firstName: ?string,
  |},
  +$fragmentSpreads: RelayReaderRequiredFieldsTest4Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest22Query = {|
  response: RelayReaderRequiredFieldsTest22Query$data,
  variables: RelayReaderRequiredFieldsTest22Query$variables,
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
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest22Query",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
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
        },
        "action": "LOG"
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderRequiredFieldsTest4Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest22Query",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "lastName",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cc106828c6edd0dbdc75638ad228a75f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest22Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest22Query {\n  me {\n    firstName\n    id\n  }\n  ...RelayReaderRequiredFieldsTest4Fragment\n}\n\nfragment RelayReaderRequiredFieldsTest4Fragment on Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "946fc6d4cbd8ac06392b207d167fc8fe";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest22Query$variables,
  RelayReaderRequiredFieldsTest22Query$data,
>*/);
