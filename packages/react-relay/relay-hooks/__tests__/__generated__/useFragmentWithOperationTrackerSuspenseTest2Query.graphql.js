/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<922be867c0945e08da2869ae2c434242>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType } from "./useFragmentWithOperationTrackerSuspenseTest2Fragment.graphql";
export type useFragmentWithOperationTrackerSuspenseTest2Query$variables = {|
  ids: ReadonlyArray<string>,
|};
export type useFragmentWithOperationTrackerSuspenseTest2Query$data = {|
  +nodes: ?ReadonlyArray<?{|
    +__typename: string,
    +$fragmentSpreads: useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  |}>,
|};
export type useFragmentWithOperationTrackerSuspenseTest2Query = {|
  response: useFragmentWithOperationTrackerSuspenseTest2Query$data,
  variables: useFragmentWithOperationTrackerSuspenseTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "ids",
    "variableName": "ids"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentWithOperationTrackerSuspenseTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentWithOperationTrackerSuspenseTest2Fragment"
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
    "name": "useFragmentWithOperationTrackerSuspenseTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "4cb26a7bcb405059c32fa70e0c47fe25",
    "id": null,
    "metadata": {},
    "name": "useFragmentWithOperationTrackerSuspenseTest2Query",
    "operationKind": "query",
    "text": "query useFragmentWithOperationTrackerSuspenseTest2Query(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...useFragmentWithOperationTrackerSuspenseTest2Fragment\n    id\n  }\n}\n\nfragment useFragmentWithOperationTrackerSuspenseTest2Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "06302c0cd4cc001ebbdab28a2512483d";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentWithOperationTrackerSuspenseTest2Query$variables,
  useFragmentWithOperationTrackerSuspenseTest2Query$data,
>*/);
