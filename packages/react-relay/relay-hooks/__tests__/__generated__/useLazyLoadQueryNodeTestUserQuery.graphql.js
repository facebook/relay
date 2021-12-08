/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9c88a5f1a493242770c7a07da3195990>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useLazyLoadQueryNodeTestUserFragment$fragmentType = any;
export type useLazyLoadQueryNodeTestUserQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeTestUserQueryVariables = useLazyLoadQueryNodeTestUserQuery$variables;
export type useLazyLoadQueryNodeTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useLazyLoadQueryNodeTestUserFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeTestUserQueryResponse = useLazyLoadQueryNodeTestUserQuery$data;
export type useLazyLoadQueryNodeTestUserQuery = {|
  variables: useLazyLoadQueryNodeTestUserQueryVariables,
  response: useLazyLoadQueryNodeTestUserQuery$data,
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeTestUserQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "useLazyLoadQueryNodeTestUserFragment"
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
    "name": "useLazyLoadQueryNodeTestUserQuery",
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
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a044dc7f40ced768f0d05756c7b7dae3",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeTestUserQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeTestUserQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useLazyLoadQueryNodeTestUserFragment\n  }\n}\n\nfragment useLazyLoadQueryNodeTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bc3d98c6a2a45e4247e409cca1d3f06f";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeTestUserQuery$variables,
  useLazyLoadQueryNodeTestUserQuery$data,
>*/);
