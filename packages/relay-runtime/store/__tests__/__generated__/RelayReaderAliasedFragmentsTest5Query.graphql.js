/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<21212385ce4a862eb7cd6369f23c577d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType } from "./RelayReaderAliasedFragmentsTest_maybe_node_interface.graphql";
export type RelayReaderAliasedFragmentsTest5Query$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTest5Query$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest5Query = {|
  response: RelayReaderAliasedFragmentsTest5Query$data,
  variables: RelayReaderAliasedFragmentsTest5Query$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTest5Query",
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
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "RelayReaderAliasedFragmentsTest_maybe_node_interface"
                }
              ],
              "type": "MaybeNodeInterface",
              "abstractKey": "__isMaybeNodeInterface"
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
    "name": "RelayReaderAliasedFragmentsTest5Query",
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "MaybeNodeInterface",
            "abstractKey": "__isMaybeNodeInterface"
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
    "cacheID": "a60f1beac6e4d777ae7a74ade4350e9e",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest5Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest5Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderAliasedFragmentsTest_maybe_node_interface\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTest_maybe_node_interface on MaybeNodeInterface {\n  __isMaybeNodeInterface: __typename\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "af2c6a63c8c707dff45a36bdf00e3169";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest5Query$variables,
  RelayReaderAliasedFragmentsTest5Query$data,
>*/);
