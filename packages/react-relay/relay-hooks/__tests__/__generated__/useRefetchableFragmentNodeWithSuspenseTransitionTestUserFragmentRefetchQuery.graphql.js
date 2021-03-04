/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c21e2dcca663a4113b5385b9b6ad4608>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQueryVariables = {|
  scale?: ?number,
  id: string,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref,
  |},
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery = {|
  variables: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQueryVariables,
  response: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQueryResponse,
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
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery",
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
            "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment"
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
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery",
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
    "cacheID": "c62b8041b5c9798c26e175caf678c8e4",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery(\n  $scale: Float\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5667a4d9b630416b46fa8e8124d4470c";
}

module.exports = node;
