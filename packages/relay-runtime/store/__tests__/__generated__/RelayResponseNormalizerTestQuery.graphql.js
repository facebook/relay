/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f4606459e784318a15ea3f6dbda65a19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest8Fragment$fragmentType = any;
export type RelayResponseNormalizerTestQuery$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTestQueryVariables = RelayResponseNormalizerTestQuery$variables;
export type RelayResponseNormalizerTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest8Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTestQueryResponse = RelayResponseNormalizerTestQuery$data;
export type RelayResponseNormalizerTestQuery = {|
  variables: RelayResponseNormalizerTestQueryVariables,
  response: RelayResponseNormalizerTestQuery$data,
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
    "name": "RelayResponseNormalizerTestQuery",
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
            "name": "RelayResponseNormalizerTest8Fragment"
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
    "name": "RelayResponseNormalizerTestQuery",
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
                "label": "RelayResponseNormalizerTest8Fragment$stream$actors",
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
    "cacheID": "b640fb9713191be1875743e6167ab32c",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest8Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest8Fragment on Feedback {\n  id\n  actors @stream(label: \"RelayResponseNormalizerTest8Fragment$stream$actors\", if: true, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a4ef71f79408fa39d099bcbaa28d35e4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestQuery$variables,
  RelayResponseNormalizerTestQuery$data,
>*/);
