/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cfdc973bf123003c21bae07b085a8505>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest11Fragment$fragmentType = any;
export type RelayResponseNormalizerTest14Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest14QueryVariables = RelayResponseNormalizerTest14Query$variables;
export type RelayResponseNormalizerTest14Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest11Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest14QueryResponse = RelayResponseNormalizerTest14Query$data;
export type RelayResponseNormalizerTest14Query = {|
  variables: RelayResponseNormalizerTest14QueryVariables,
  response: RelayResponseNormalizerTest14Query$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest14Query",
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
            "name": "RelayResponseNormalizerTest11Fragment"
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
    "name": "RelayResponseNormalizerTest14Query",
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
                "if": null,
                "kind": "Stream",
                "label": "RelayResponseNormalizerTest11Fragment$stream$actors",
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
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
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
    "cacheID": "f9a6357998563d895e3fb767d8458630",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest14Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest14Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest11Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest11Fragment on Feedback {\n  id\n  actors @stream(label: \"RelayResponseNormalizerTest11Fragment$stream$actors\", initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c173a8d4e918b5aaecb1da24d9f8f854";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest14Query$variables,
  RelayResponseNormalizerTest14Query$data,
>*/);
