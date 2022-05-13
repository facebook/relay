/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fdc1d2ac6bdafdd877e8c3869ed85bcd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type RelayReaderResolverTest2Fragment$fragmentType = any;
export type RelayReaderResolverTest1FragmentRefetchableQuery$variables = {|
  id: string,
|};
export type RelayReaderResolverTest1FragmentRefetchableQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReaderResolverTest2Fragment$fragmentType,
  |},
|};
export type RelayReaderResolverTest1FragmentRefetchableQuery = {|
  response: RelayReaderResolverTest1FragmentRefetchableQuery$data,
  variables: RelayReaderResolverTest1FragmentRefetchableQuery$variables,
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
    "name": "RelayReaderResolverTest1FragmentRefetchableQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderResolverTest2Fragment"
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
    "name": "RelayReaderResolverTest1FragmentRefetchableQuery",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "98c7c7fdc634488517bd21f494ccc760",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest1FragmentRefetchableQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest1FragmentRefetchableQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderResolverTest2Fragment\n    id\n  }\n}\n\nfragment RelayReaderResolverTest2Fragment on User {\n  ...UserGreetingResolver\n  id\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4e682183594a1a0c644eb582547abed6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest1FragmentRefetchableQuery$variables,
  RelayReaderResolverTest1FragmentRefetchableQuery$data,
>*/);
