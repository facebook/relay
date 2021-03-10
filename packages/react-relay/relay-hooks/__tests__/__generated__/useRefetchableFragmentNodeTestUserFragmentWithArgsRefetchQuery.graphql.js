/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f7dce09b29afe3d6a47b818bbf2c41a3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestUserFragmentWithArgs$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType: useRefetchableFragmentNodeTestUserFragmentWithArgs$ref;
export type useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQueryVariables = {|
  scaleLocal: number,
  id: string,
|};
export type useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: useRefetchableFragmentNodeTestUserFragmentWithArgs$ref,
  |},
|};
export type useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery = {|
  variables: useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQueryVariables,
  response: useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQueryResponse,
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
  "name": "scaleLocal"
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
    "name": "useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery",
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
            "args": [
              {
                "kind": "Variable",
                "name": "scaleLocal",
                "variableName": "scaleLocal"
              }
            ],
            "kind": "FragmentSpread",
            "name": "useRefetchableFragmentNodeTestUserFragmentWithArgs"
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
    "name": "useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery",
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
                    "variableName": "scaleLocal"
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
    "cacheID": "f7b1a66ac917ed2dbed0d2f30e21e013",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery(\n  $scaleLocal: Float!\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeTestUserFragmentWithArgs_4veoTP\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTestUserFragmentWithArgs_4veoTP on User {\n  id\n  name\n  profile_picture(scale: $scaleLocal) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "66560c7839480e9e6d2891c5dbcd2039";
}

module.exports = node;
