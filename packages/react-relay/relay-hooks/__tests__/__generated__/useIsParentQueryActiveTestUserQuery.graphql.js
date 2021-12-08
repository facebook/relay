/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<93ccd5a6919566b3513c2cd4fd885306>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useIsParentQueryActiveTestUserFragment$fragmentType = any;
export type useIsParentQueryActiveTestUserQuery$variables = {|
  id: string,
|};
export type useIsParentQueryActiveTestUserQueryVariables = useIsParentQueryActiveTestUserQuery$variables;
export type useIsParentQueryActiveTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useIsParentQueryActiveTestUserFragment$fragmentType,
  |},
|};
export type useIsParentQueryActiveTestUserQueryResponse = useIsParentQueryActiveTestUserQuery$data;
export type useIsParentQueryActiveTestUserQuery = {|
  variables: useIsParentQueryActiveTestUserQueryVariables,
  response: useIsParentQueryActiveTestUserQuery$data,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useIsParentQueryActiveTestUserQuery",
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
            "name": "useIsParentQueryActiveTestUserFragment"
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
    "name": "useIsParentQueryActiveTestUserQuery",
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
    "cacheID": "57d3f663dda59e568be856de26633e3d",
    "id": null,
    "metadata": {},
    "name": "useIsParentQueryActiveTestUserQuery",
    "operationKind": "query",
    "text": "query useIsParentQueryActiveTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useIsParentQueryActiveTestUserFragment\n    id\n  }\n}\n\nfragment useIsParentQueryActiveTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f41a54a0c430c98e7f9e1975a2cfac15";
}

module.exports = ((node/*: any*/)/*: Query<
  useIsParentQueryActiveTestUserQuery$variables,
  useIsParentQueryActiveTestUserQuery$data,
>*/);
