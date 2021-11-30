/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<98820f5a9042bd9430ae99a63b47df91>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type useRefetchableFragmentTestUserFragment$fragmentType = any;
export type useRefetchableFragmentTestUserFragmentRefetchQuery$variables = {|
  scale?: ?number,
  id: string,
|};
export type useRefetchableFragmentTestUserFragmentRefetchQueryVariables = useRefetchableFragmentTestUserFragmentRefetchQuery$variables;
export type useRefetchableFragmentTestUserFragmentRefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentTestUserFragment$fragmentType,
  |},
|};
export type useRefetchableFragmentTestUserFragmentRefetchQueryResponse = useRefetchableFragmentTestUserFragmentRefetchQuery$data;
export type useRefetchableFragmentTestUserFragmentRefetchQuery = {|
  variables: useRefetchableFragmentTestUserFragmentRefetchQueryVariables,
  response: useRefetchableFragmentTestUserFragmentRefetchQuery$data,
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
    "name": "useRefetchableFragmentTestUserFragmentRefetchQuery",
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
            "name": "useRefetchableFragmentTestUserFragment"
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
    "name": "useRefetchableFragmentTestUserFragmentRefetchQuery",
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
    "cacheID": "b4664f24de72f848f9de8c1877ebf6ba",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentTestUserFragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentTestUserFragmentRefetchQuery(\n  $scale: Float\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentTestUserFragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d770b0dc72756ed4ba66dee386a91acf";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentTestUserFragmentRefetchQuery$variables,
  useRefetchableFragmentTestUserFragmentRefetchQuery$data,
>*/);
