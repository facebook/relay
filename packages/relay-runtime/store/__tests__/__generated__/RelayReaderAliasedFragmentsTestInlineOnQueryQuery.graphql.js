/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c7c5a8f67d82143a556d6da4658e6372>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestInlineOnQueryQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestInlineOnQueryQuery$data = {|
  +aliased_fragment: {|
    +me: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestInlineOnQueryQuery = {|
  response: RelayReaderAliasedFragmentsTestInlineOnQueryQuery$data,
  variables: RelayReaderAliasedFragmentsTestInlineOnQueryQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "RelayReaderAliasedFragmentsTestInlineOnQueryQuery",
    "selections": [
      {
        "fragment": {
          "kind": "InlineFragment",
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
                  "kind": "RequiredField",
                  "field": (v0/*: any*/),
                  "action": "NONE"
                }
              ],
              "storageKey": null
            }
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "AliasedInlineFragmentSpread",
        "name": "aliased_fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestInlineOnQueryQuery",
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
    "cacheID": "0252ebb4b80ffc51c95bde3821206725",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestInlineOnQueryQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestInlineOnQueryQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2f5cf13fece8ca972ccbc46bc8b1c758";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestInlineOnQueryQuery$variables,
  RelayReaderAliasedFragmentsTestInlineOnQueryQuery$data,
>*/);
