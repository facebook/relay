/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cdaa91068807332efb955fbdb8448af5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type DataCheckerTest7Fragment$fragmentType = any;
export type DataCheckerTest6Query$variables = {|
  id: string,
|};
export type DataCheckerTest6QueryVariables = DataCheckerTest6Query$variables;
export type DataCheckerTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: DataCheckerTest7Fragment$fragmentType,
  |},
|};
export type DataCheckerTest6QueryResponse = DataCheckerTest6Query$data;
export type DataCheckerTest6Query = {|
  variables: DataCheckerTest6QueryVariables,
  response: DataCheckerTest6Query$data,
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
    "name": "DataCheckerTest6Query",
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
            "name": "DataCheckerTest7Fragment"
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
    "name": "DataCheckerTest6Query",
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
                "label": "DataCheckerTest7Fragment$stream$TestFragmentActors",
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
    "cacheID": "4a9e3c65b69fc17a4d0d5a36cead3881",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest6Query",
    "operationKind": "query",
    "text": "query DataCheckerTest6Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...DataCheckerTest7Fragment\n    id\n  }\n}\n\nfragment DataCheckerTest7Fragment on Feedback {\n  id\n  actors @stream(label: \"DataCheckerTest7Fragment$stream$TestFragmentActors\", initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e8bc7d9a84fa2e9536aed16887b17a29";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest6Query$variables,
  DataCheckerTest6Query$data,
>*/);
