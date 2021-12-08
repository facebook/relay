/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c990471b464ece718c2b32dbf1bf629>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type DataCheckerTest6Fragment$fragmentType = any;
export type DataCheckerTest9Query$variables = {|
  id: string,
|};
export type DataCheckerTest9QueryVariables = DataCheckerTest9Query$variables;
export type DataCheckerTest9Query$data = {|
  +node: ?{|
    +$fragmentSpreads: DataCheckerTest6Fragment$fragmentType,
  |},
|};
export type DataCheckerTest9QueryResponse = DataCheckerTest9Query$data;
export type DataCheckerTest9Query = {|
  variables: DataCheckerTest9QueryVariables,
  response: DataCheckerTest9Query$data,
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
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTest9Query",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DataCheckerTest6Fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DataCheckerTest9Query",
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
            "if": null,
            "kind": "Defer",
            "label": "DataCheckerTest9Query$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
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
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "75d27f956b86114270cd6351708849be",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest9Query",
    "operationKind": "query",
    "text": "query DataCheckerTest9Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...DataCheckerTest6Fragment @defer(label: \"DataCheckerTest9Query$defer$TestFragment\")\n    id\n  }\n}\n\nfragment DataCheckerTest6Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ae64013fff9f02d31b27ea607016ea03";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest9Query$variables,
  DataCheckerTest9Query$data,
>*/);
