/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7fa774d748cce9143993308d7770450>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTest10Query$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTest10Query$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +id: string,
      +tracking: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest10Query = {|
  response: RelayReaderAliasedFragmentsTest10Query$data,
  variables: RelayReaderAliasedFragmentsTest10Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tracking",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTest10Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                (v2/*: any*/),
                {
                  "kind": "RequiredField",
                  "field": (v3/*: any*/),
                  "action": "NONE"
                }
              ],
              "type": "Comment",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTest10Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7b2ab91b486769df914ff996a7beebe2",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest10Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest10Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on Comment {\n      id\n      tracking\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5220acab289b9188a29ff62e4822d9ca";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest10Query$variables,
  RelayReaderAliasedFragmentsTest10Query$data,
>*/);
