/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a8998359fcaf93758be27a502ce02bd0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$variables = {||};
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$data = {|
  +me: ?{|
    +requiredFields: ?{|
      +backgroundImage: {|
        +uri: string,
      |},
    |},
  |},
|};
export type RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery = {|
  response: RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$data,
  variables: RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$variables,
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
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery",
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
              "type": "User",
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
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery",
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
    "cacheID": "0ffed2e7ad10cb518c2ce832925ff3d8",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery {\n  me {\n    backgroundImage {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4511503ad7e5191998ea5cb15995a0cc";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$variables,
  RelayReaderRequiredFieldsTestBubbleToAliasedInlineFragmentWithTypeQuery$data,
>*/);
