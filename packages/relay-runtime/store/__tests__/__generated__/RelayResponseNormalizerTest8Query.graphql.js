/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ce52d69a7bd6e2a36b613730872d560>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest4Fragment$fragmentType = any;
export type RelayResponseNormalizerTest8Query$variables = {|
  id: string,
  enableDefer: boolean,
|};
export type RelayResponseNormalizerTest8QueryVariables = RelayResponseNormalizerTest8Query$variables;
export type RelayResponseNormalizerTest8Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest4Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest8QueryResponse = RelayResponseNormalizerTest8Query$data;
export type RelayResponseNormalizerTest8Query = {|
  variables: RelayResponseNormalizerTest8QueryVariables,
  response: RelayResponseNormalizerTest8Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableDefer"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest8Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTest4Fragment"
              }
            ]
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest8Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
            "if": "enableDefer",
            "kind": "Defer",
            "label": "RelayResponseNormalizerTest8Query$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/),
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
            ]
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "16f124d05c0e82b8adb162917ecfbc7a",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest8Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest8Query(\n  $id: ID!\n  $enableDefer: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest4Fragment @defer(label: \"RelayResponseNormalizerTest8Query$defer$TestFragment\", if: $enableDefer)\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest4Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "636c5d32b4dd2e8695c5f9e9db86fa08";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest8Query$variables,
  RelayResponseNormalizerTest8Query$data,
>*/);
