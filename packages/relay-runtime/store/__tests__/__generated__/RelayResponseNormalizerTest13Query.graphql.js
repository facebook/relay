/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<22eda08038947e244d93705c423f60b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest10Fragment$fragmentType = any;
export type RelayResponseNormalizerTest13Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest13QueryVariables = RelayResponseNormalizerTest13Query$variables;
export type RelayResponseNormalizerTest13Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest10Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest13QueryResponse = RelayResponseNormalizerTest13Query$data;
export type RelayResponseNormalizerTest13Query = {|
  variables: RelayResponseNormalizerTest13QueryVariables,
  response: RelayResponseNormalizerTest13Query$data,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest13Query",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest13Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
                  (v2/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v4/*: any*/),
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
                              (v2/*: any*/),
                              (v4/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "type": "User",
                    "abstractKey": null
                  },
                  (v3/*: any*/)
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
  (node/*: any*/).hash = "d9638dd9dcaa4dd9c95795b109acd65c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest13Query$variables,
  RelayResponseNormalizerTest13Query$data,
>*/);
