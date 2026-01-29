/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7268a9bb4ca135bfccb76bb523920054>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$variables = {||};
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$data = {|
  +me: ?{|
    +requiredFields: ?{|
      +backgroundImage: {|
        +uri: string,
      |},
    |},
  |},
|};
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery = {|
  response: RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$data,
  variables: RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery",
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
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "Image",
                    "kind": "LinkedField",
                    "name": "backgroundImage",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "RequiredField",
                        "field": (v0/*: any*/),
                        "action": "LOG"
                      }
                    ],
                    "storageKey": null
                  },
                  "action": "LOG"
                }
              ],
              "type": null,
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "requiredFields"
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
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery",
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
            "alias": null,
            "args": null,
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "backgroundImage",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
          },
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
    "cacheID": "9a3c80d36cc49662a1e808d9a1d03cd4",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery {\n  me {\n    backgroundImage {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8ffc3f3576c04809264bbc5cf439e34d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$variables,
  RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithoutTypeQuery$data,
>*/);
