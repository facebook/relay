/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e3d02df6cdc3fcc1179a75f603749fd7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useRefetchableFragmentNodeTestUserFragment$fragmentType = any;
export type useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$variables = {|
  id: string,
  scale: number,
|};
export type useRefetchableFragmentNodeTestUserQueryNestedFragmentQueryVariables = useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$variables;
export type useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$data = {|
  +node: ?{|
    +actor: ?{|
      +$fragmentSpreads: useRefetchableFragmentNodeTestUserFragment$fragmentType,
    |},
  |},
|};
export type useRefetchableFragmentNodeTestUserQueryNestedFragmentQueryResponse = useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$data;
export type useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery = {|
  variables: useRefetchableFragmentNodeTestUserQueryNestedFragmentQueryVariables,
  response: useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
    "name": "useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery",
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useRefetchableFragmentNodeTestUserFragment"
              }
            ],
            "storageKey": null
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
    "name": "useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery",
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
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
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
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b4548d5204e539232d3a984363c0026b",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    actor {\n      __typename\n      ...useRefetchableFragmentNodeTestUserFragment\n      id\n    }\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "845c776ed52ad25feb496e052f8f65cb";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$variables,
  useRefetchableFragmentNodeTestUserQueryNestedFragmentQuery$data,
>*/);
