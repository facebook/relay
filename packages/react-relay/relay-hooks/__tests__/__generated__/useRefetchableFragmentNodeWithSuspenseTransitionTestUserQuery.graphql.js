/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<911fd181fa660f0878ee26251b9076a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType = any;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$variables = {|
  id: string,
  scale: number,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserQueryVariables = useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$variables;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserQueryResponse = useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$data;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery = {|
  variables: useRefetchableFragmentNodeWithSuspenseTransitionTestUserQueryVariables,
  response: useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$data,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery",
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
    "cacheID": "9802830c7a3996105231d3ae47479d2a",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7dd300784a6642a4b84870d9abd398b9";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$variables,
  useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery$data,
>*/);
