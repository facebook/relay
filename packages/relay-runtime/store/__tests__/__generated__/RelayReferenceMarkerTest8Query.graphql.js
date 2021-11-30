/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c078d85413c3ce1c147388cbe9060d5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest6Fragment$fragmentType = any;
export type RelayReferenceMarkerTest8Query$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTest8QueryVariables = RelayReferenceMarkerTest8Query$variables;
export type RelayReferenceMarkerTest8Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReferenceMarkerTest6Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest8QueryResponse = RelayReferenceMarkerTest8Query$data;
export type RelayReferenceMarkerTest8Query = {|
  variables: RelayReferenceMarkerTest8QueryVariables,
  response: RelayReferenceMarkerTest8Query$data,
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
    "name": "RelayReferenceMarkerTest8Query",
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
            "name": "RelayReferenceMarkerTest6Fragment"
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
    "name": "RelayReferenceMarkerTest8Query",
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
                "label": "RelayReferenceMarkerTest6Fragment$stream$TestFragmentActors",
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
    "cacheID": "077312c25b54668d36c6c3a6d048725f",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest8Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest8Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReferenceMarkerTest6Fragment\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest6Fragment on Feedback {\n  id\n  actors @stream(label: \"RelayReferenceMarkerTest6Fragment$stream$TestFragmentActors\", initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "30e3b31096520d2b76871a970230f544";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest8Query$variables,
  RelayReferenceMarkerTest8Query$data,
>*/);
