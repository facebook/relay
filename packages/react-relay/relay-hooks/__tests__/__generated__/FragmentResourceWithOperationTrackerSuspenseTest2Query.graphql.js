/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a8ae5d5cf2446669bb5e7ead996db06a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType } from "./FragmentResourceWithOperationTrackerSuspenseTest2Fragment.graphql";
export type FragmentResourceWithOperationTrackerSuspenseTest2Query$variables = {|
  ids: ReadonlyArray<string>,
|};
export type FragmentResourceWithOperationTrackerSuspenseTest2Query$data = {|
  +nodes: ?ReadonlyArray<?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  |}>,
|};
export type FragmentResourceWithOperationTrackerSuspenseTest2Query = {|
  response: FragmentResourceWithOperationTrackerSuspenseTest2Query$data,
  variables: FragmentResourceWithOperationTrackerSuspenseTest2Query$variables,
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTest2Query",
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
            "name": "FragmentResourceWithOperationTrackerSuspenseTest2Fragment"
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTest2Query",
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
    "cacheID": "63f940988c565dc9600a3d3ccd7e92cd",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceWithOperationTrackerSuspenseTest2Query",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerSuspenseTest2Query(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...FragmentResourceWithOperationTrackerSuspenseTest2Fragment\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerSuspenseTest2Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f32d541459443bcb33b1bd0bff9a612e";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerSuspenseTest2Query$variables,
  FragmentResourceWithOperationTrackerSuspenseTest2Query$data,
>*/);
