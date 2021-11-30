/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<00c215d5b3b309a789417d90a29ba098>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type useRefetchableFragmentNodeTest1Fragment$fragmentType = any;
export type useRefetchableFragmentNodeTest1FragmentRefetchQuery$variables = {|
  id: string,
|};
export type useRefetchableFragmentNodeTest1FragmentRefetchQueryVariables = useRefetchableFragmentNodeTest1FragmentRefetchQuery$variables;
export type useRefetchableFragmentNodeTest1FragmentRefetchQuery$data = {|
  +fetch__NonNodeStory: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTest1Fragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTest1FragmentRefetchQueryResponse = useRefetchableFragmentNodeTest1FragmentRefetchQuery$data;
export type useRefetchableFragmentNodeTest1FragmentRefetchQuery = {|
  variables: useRefetchableFragmentNodeTest1FragmentRefetchQueryVariables,
  response: useRefetchableFragmentNodeTest1FragmentRefetchQuery$data,
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
    "name": "input_fetch_id",
    "variableName": "id"
  }
],
v2 = {
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
    "name": "useRefetchableFragmentNodeTest1FragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "fetch__NonNodeStory",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useRefetchableFragmentNodeTest1Fragment"
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
    "name": "useRefetchableFragmentNodeTest1FragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "fetch__NonNodeStory",
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
                "name": "name",
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fetch_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__token",
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f90df4dc16ad217f9e91605e41c7bebe",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTest1FragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTest1FragmentRefetchQuery(\n  $id: ID!\n) {\n  fetch__NonNodeStory(input_fetch_id: $id) {\n    ...useRefetchableFragmentNodeTest1Fragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTest1Fragment on NonNodeStory {\n  actor {\n    __typename\n    name\n    id\n  }\n  fetch_id\n  __token\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5edfb0ad9be0c72a1ba5d714bff331ae";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTest1FragmentRefetchQuery$variables,
  useRefetchableFragmentNodeTest1FragmentRefetchQuery$data,
>*/);
