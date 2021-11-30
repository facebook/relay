/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bb3260c1a865910752197ec4fb4d21b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useLazyLoadQueryNodeTestRootFragment$fragmentType = any;
export type useLazyLoadQueryNodeTestOnlyFragmentsQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeTestOnlyFragmentsQueryVariables = useLazyLoadQueryNodeTestOnlyFragmentsQuery$variables;
export type useLazyLoadQueryNodeTestOnlyFragmentsQuery$data = {|
  +$fragmentSpreads: useLazyLoadQueryNodeTestRootFragment$fragmentType,
|};
export type useLazyLoadQueryNodeTestOnlyFragmentsQueryResponse = useLazyLoadQueryNodeTestOnlyFragmentsQuery$data;
export type useLazyLoadQueryNodeTestOnlyFragmentsQuery = {|
  variables: useLazyLoadQueryNodeTestOnlyFragmentsQueryVariables,
  response: useLazyLoadQueryNodeTestOnlyFragmentsQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeTestOnlyFragmentsQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "useLazyLoadQueryNodeTestRootFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useLazyLoadQueryNodeTestOnlyFragmentsQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "id"
          }
        ],
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7d473cd63df63948e1673f6971f8ca0e",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeTestOnlyFragmentsQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeTestOnlyFragmentsQuery(\n  $id: ID\n) {\n  ...useLazyLoadQueryNodeTestRootFragment\n}\n\nfragment useLazyLoadQueryNodeTestRootFragment on Query {\n  node(id: $id) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "01b943dc86633c9c75db8215fb4fbfa1";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeTestOnlyFragmentsQuery$variables,
  useLazyLoadQueryNodeTestOnlyFragmentsQuery$data,
>*/);
