/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eb0c1262c711ce01574c7623cf800cf5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useRefetchableFragmentNodeTest1Fragment$fragmentType = any;
export type useRefetchableFragmentNodeTest1Query$variables = {|
  id: string,
|};
export type useRefetchableFragmentNodeTest1QueryVariables = useRefetchableFragmentNodeTest1Query$variables;
export type useRefetchableFragmentNodeTest1Query$data = {|
  +nonNodeStory: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTest1Fragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTest1QueryResponse = useRefetchableFragmentNodeTest1Query$data;
export type useRefetchableFragmentNodeTest1Query = {|
  variables: useRefetchableFragmentNodeTest1QueryVariables,
  response: useRefetchableFragmentNodeTest1Query$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useRefetchableFragmentNodeTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "nonNodeStory",
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
    "name": "useRefetchableFragmentNodeTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "nonNodeStory",
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
    "cacheID": "48452883758b52f03c316637a58a7bf9",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTest1Query",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTest1Query(\n  $id: ID!\n) {\n  nonNodeStory(id: $id) {\n    ...useRefetchableFragmentNodeTest1Fragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTest1Fragment on NonNodeStory {\n  actor {\n    __typename\n    name\n    id\n  }\n  fetch_id\n  __token\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3e85459031771c5b73d57f631a2d33e5";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTest1Query$variables,
  useRefetchableFragmentNodeTest1Query$data,
>*/);
