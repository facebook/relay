/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ec6828c373474992b3557c02b6cf16cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResponseNormalizerTest10Fragment$fragmentType } from "./RelayResponseNormalizerTest10Fragment.graphql";
export type RelayResponseNormalizerTest13Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest13Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest10Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest13Query = {|
  response: RelayResponseNormalizerTest13Query$data,
  variables: RelayResponseNormalizerTest13Query$variables,
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest13Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayResponseNormalizerTest10Fragment"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest13Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actors",
                "plural": true,
                "selections": [
                  (v2/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "if": null,
                        "kind": "Stream",
                        "label": "RelayResponseNormalizerTest10Fragment$stream$actors",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "actors",
                            "plural": true,
                            "selections": [
                              (v2/*:: as any*/),
                              (v4/*:: as any*/),
                              (v3/*:: as any*/)
                            ],
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "type": "User",
                    "abstractKey": null
                  },
                  (v3/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4e26851e8c3e97fd86dff083f0437731",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest13Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest13Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest10Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest10Fragment on Feedback {\n  id\n  actors {\n    __typename\n    ... on User {\n      name\n      actors @stream(label: \"RelayResponseNormalizerTest10Fragment$stream$actors\", if: true, initial_count: 0) {\n        __typename\n        name\n        id\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "b1fa2fdbc204811f15d320177b37e116";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest13Query$variables,
  RelayResponseNormalizerTest13Query$data,
>*/);
