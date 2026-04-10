/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f88ed9bdb69f515c21df4f6dde598957>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest13Query$variables = {||};
export type RelayReaderRequiredFieldsTest13Query$data = {|
  +maybeNodeInterface: ?({|
    +__typename: "Story",
    +lastName: string,
    +name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type RelayReaderRequiredFieldsTest13Query = {|
  response: RelayReaderRequiredFieldsTest13Query$data,
  variables: RelayReaderRequiredFieldsTest13Query$variables,
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
                "field": (v0/*:: as any*/),
                "action": "LOG"
              }
            ],
            "type": "Story",
            "abstractKey": null
          },
          (v1/*:: as any*/)
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
              (v0/*:: as any*/)
            ],
            "type": "Story",
            "abstractKey": null
          },
          (v1/*:: as any*/),
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
  (node/*:: as any*/).hash = "18341e049af32096dfb61320b3f823d8";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRequiredFieldsTest13Query$variables,
  RelayReaderRequiredFieldsTest13Query$data,
>*/);
