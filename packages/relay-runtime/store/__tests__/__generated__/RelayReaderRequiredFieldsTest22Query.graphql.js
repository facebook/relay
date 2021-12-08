/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5910e99d5280339bf892e4526c118b42>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderRequiredFieldsTest4Fragment$fragmentType = any;
export type RelayReaderRequiredFieldsTest22Query$variables = {||};
export type RelayReaderRequiredFieldsTest22QueryVariables = RelayReaderRequiredFieldsTest22Query$variables;
export type RelayReaderRequiredFieldsTest22Query$data = ?{|
  +me: {|
    +firstName: ?string,
  |},
  +$fragmentSpreads: RelayReaderRequiredFieldsTest4Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest22QueryResponse = RelayReaderRequiredFieldsTest22Query$data;
export type RelayReaderRequiredFieldsTest22Query = {|
  variables: RelayReaderRequiredFieldsTest22QueryVariables,
  response: RelayReaderRequiredFieldsTest22Query$data,
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
        "action": "LOG",
        "path": "me"
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
