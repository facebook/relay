/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<078500eba8f406d0ee02284389661bd5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTest6Query$variables = {||};
export type RelayReaderAliasedFragmentsTest6Query$data = {|
  +me: ?{|
    +aliased_fragment: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest6Query = {|
  response: RelayReaderAliasedFragmentsTest6Query$data,
  variables: RelayReaderAliasedFragmentsTest6Query$variables,
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
    "name": "RelayReaderAliasedFragmentsTest6Query",
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
                  "field": (v0/*: any*/),
                  "action": "NONE"
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
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
    "name": "RelayReaderAliasedFragmentsTest6Query",
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
    "cacheID": "0d138c98b2b7dad8231801706f76953f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest6Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest6Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "24fe7d5478a70415faf6e8ae31989c84";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest6Query$variables,
  RelayReaderAliasedFragmentsTest6Query$data,
>*/);
