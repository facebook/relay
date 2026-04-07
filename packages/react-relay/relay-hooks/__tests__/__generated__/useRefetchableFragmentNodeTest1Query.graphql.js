/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e3e1f5593068d8ec128ce88efc585118>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useRefetchableFragmentNodeTest1Fragment$fragmentType } from "./useRefetchableFragmentNodeTest1Fragment.graphql";
export type useRefetchableFragmentNodeTest1Query$variables = {|
  id: string,
|};
export type useRefetchableFragmentNodeTest1Query$data = {|
  +nonNodeStory: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTest1Fragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTest1Query = {|
  response: useRefetchableFragmentNodeTest1Query$data,
  variables: useRefetchableFragmentNodeTest1Query$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useRefetchableFragmentNodeTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useRefetchableFragmentNodeTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
              (v2/*:: as any*/)
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
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2b1fe038fd3a80f4e81b56e3b864e547",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTest1Query",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTest1Query(\n  $id: ID!\n) {\n  nonNodeStory(id: $id) {\n    ...useRefetchableFragmentNodeTest1Fragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTest1Fragment on NonNodeStory {\n  actor {\n    __typename\n    name\n    id\n  }\n  fetch_id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "3e85459031771c5b73d57f631a2d33e5";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useRefetchableFragmentNodeTest1Query$variables,
  useRefetchableFragmentNodeTest1Query$data,
>*/);
