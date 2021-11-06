/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0596dff1589fe871ca7f8b6654757f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderRequiredFieldsTest4Fragment$ref = any;
export type RelayReaderRequiredFieldsTest22QueryVariables = {||};
export type RelayReaderRequiredFieldsTest22QueryResponse = ?{|
  +me: {|
    +firstName: ?string,
  |},
  +$fragmentRefs: RelayReaderRequiredFieldsTest4Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest22Query = {|
  variables: RelayReaderRequiredFieldsTest22QueryVariables,
  response: RelayReaderRequiredFieldsTest22QueryResponse,
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

module.exports = node;
