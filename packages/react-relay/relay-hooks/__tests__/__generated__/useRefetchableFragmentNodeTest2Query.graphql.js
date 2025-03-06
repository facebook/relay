/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7478944cd3dbb6602b6bb6cc55549dd1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useRefetchableFragmentNodeTest3Fragment$fragmentType } from "./useRefetchableFragmentNodeTest3Fragment.graphql";
export type useRefetchableFragmentNodeTest2Query$variables = {|
  nodeID: string,
  scale: number,
|};
export type useRefetchableFragmentNodeTest2Query$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTest3Fragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTest2Query = {|
  response: useRefetchableFragmentNodeTest2Query$data,
  variables: useRefetchableFragmentNodeTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "nodeID"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "nodeID"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useRefetchableFragmentNodeTest2Query",
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
            "name": "useRefetchableFragmentNodeTest3Fragment"
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
    "name": "useRefetchableFragmentNodeTest2Query",
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
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "scale"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
    "cacheID": "11ea71a3bbb7cb33d7e21990a19d2109",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTest2Query",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTest2Query(\n  $nodeID: ID!\n  $scale: Float!\n) {\n  node(id: $nodeID) {\n    __typename\n    ...useRefetchableFragmentNodeTest3Fragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTest2Fragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTest3Fragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTest2Fragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c6d3e08c02e35bb5a19b2b9736e4fc14";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTest2Query$variables,
  useRefetchableFragmentNodeTest2Query$data,
>*/);
