/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f9c459980094343d4c20243b3bb9ed87>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResponseNormalizerTest42Fragment$fragmentType } from "./RelayResponseNormalizerTest42Fragment.graphql";
export type RelayResponseNormalizerTest42Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest42Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest42Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest42Query = {|
  response: RelayResponseNormalizerTest42Query$data,
  variables: RelayResponseNormalizerTest42Query$variables,
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
    "name": "RelayResponseNormalizerTest42Query",
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
            "name": "RelayResponseNormalizerTest42Fragment"
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
    "name": "RelayResponseNormalizerTest42Query",
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
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
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
    "cacheID": "88937bb7d3f011243792258ece6f7218",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest42Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest42Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest42Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest42Fragment on Node {\n  __isNode: __typename\n  id\n  ... on User {\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "df5d2a14838f0b7c2322699b0f2aaf26";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest42Query$variables,
  RelayResponseNormalizerTest42Query$data,
>*/);
