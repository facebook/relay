/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31c3f2f1f5472b802d41af66c7dfa39f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest13Query$variables = {||};
export type RelayReaderRequiredFieldsTest13QueryVariables = RelayReaderRequiredFieldsTest13Query$variables;
export type RelayReaderRequiredFieldsTest13Query$data = {|
  +maybeNodeInterface: ?{|
    +name: ?string,
    +lastName?: string,
  |},
|};
export type RelayReaderRequiredFieldsTest13QueryResponse = RelayReaderRequiredFieldsTest13Query$data;
export type RelayReaderRequiredFieldsTest13Query = {|
  variables: RelayReaderRequiredFieldsTest13QueryVariables,
  response: RelayReaderRequiredFieldsTest13Query$data,
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest13Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "RequiredField",
                "field": (v0/*: any*/),
                "action": "LOG",
                "path": "maybeNodeInterface.lastName"
              }
            ],
            "type": "Story",
            "abstractKey": null
          },
          (v1/*: any*/)
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
    "name": "RelayReaderRequiredFieldsTest13Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/)
            ],
            "type": "Story",
            "abstractKey": null
          },
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b0ca621f783483be7457ddea26ebcbad",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest13Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest13Query {\n  maybeNodeInterface {\n    __typename\n    ... on Story {\n      lastName\n    }\n    name\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "18341e049af32096dfb61320b3f823d8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest13Query$variables,
  RelayReaderRequiredFieldsTest13Query$data,
>*/);
