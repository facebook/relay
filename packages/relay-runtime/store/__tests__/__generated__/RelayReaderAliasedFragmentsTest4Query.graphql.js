/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8c158719dab01ec0058aa8817e1176f6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType } from "./RelayReaderAliasedFragmentsTest_maybe_node_interface.graphql";
export type RelayReaderAliasedFragmentsTest4Query$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTest4Query$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest4Query = {|
  response: RelayReaderAliasedFragmentsTest4Query$data,
  variables: RelayReaderAliasedFragmentsTest4Query$variables,
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
    "name": "RelayReaderAliasedFragmentsTest4Query",
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
    "name": "RelayReaderAliasedFragmentsTest4Query",
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
    "cacheID": "62afbec9803074f49e87c997ad9bbddc",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest4Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderAliasedFragmentsTest_maybe_node_interface\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTest_maybe_node_interface on MaybeNodeInterface {\n  __isMaybeNodeInterface: __typename\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ac3c9429fcd045cc5ecbad54d79462d8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest4Query$variables,
  RelayReaderAliasedFragmentsTest4Query$data,
>*/);
