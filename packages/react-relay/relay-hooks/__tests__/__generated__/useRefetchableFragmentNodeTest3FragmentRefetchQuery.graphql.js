/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<699377b428b20cc49114864e974de86e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type useRefetchableFragmentNodeTest3Fragment$fragmentType = any;
export type useRefetchableFragmentNodeTest3FragmentRefetchQuery$variables = {|
  scale?: ?number,
  id: string,
|};
export type useRefetchableFragmentNodeTest3FragmentRefetchQueryVariables = useRefetchableFragmentNodeTest3FragmentRefetchQuery$variables;
export type useRefetchableFragmentNodeTest3FragmentRefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTest3Fragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTest3FragmentRefetchQueryResponse = useRefetchableFragmentNodeTest3FragmentRefetchQuery$data;
export type useRefetchableFragmentNodeTest3FragmentRefetchQuery = {|
  variables: useRefetchableFragmentNodeTest3FragmentRefetchQueryVariables,
  response: useRefetchableFragmentNodeTest3FragmentRefetchQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scale"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useRefetchableFragmentNodeTest3FragmentRefetchQuery",
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useRefetchableFragmentNodeTest3FragmentRefetchQuery",
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
    "cacheID": "f99bb69e843603c4a460ba15507b0c8c",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTest3FragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTest3FragmentRefetchQuery(\n  $scale: Float\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeTest3Fragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTest2Fragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTest3Fragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTest2Fragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2650c4a9699c99058f29e1c1d3554f01";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTest3FragmentRefetchQuery$variables,
  useRefetchableFragmentNodeTest3FragmentRefetchQuery$data,
>*/);
