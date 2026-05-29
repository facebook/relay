/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataCheckerTestDeferIfFragment$fragmentType } from "./DataCheckerTestDeferIfFragment.graphql";
export type DataCheckerTestDeferIfQuery$variables = {|
  id: string,
  shouldDefer: boolean,
|};
export type DataCheckerTestDeferIfQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: DataCheckerTestDeferIfFragment$fragmentType,
  |},
|};
export type DataCheckerTestDeferIfQuery = {|
  response: DataCheckerTestDeferIfQuery$data,
  variables: DataCheckerTestDeferIfQuery$variables,
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
    "name": "shouldDefer"
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
    "name": "DataCheckerTestDeferIfQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DataCheckerTestDeferIfFragment"
              }
            ]
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
    "name": "DataCheckerTestDeferIfQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
            "if": "shouldDefer",
            "kind": "Defer",
            "label": "DataCheckerTestDeferIfQuery$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*:: as any*/),
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
            ]
          },
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "datachecker_test_defer_if_query",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTestDeferIfQuery",
    "operationKind": "query",
    "text": "query DataCheckerTestDeferIfQuery(\n  $id: ID!\n  $shouldDefer: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...DataCheckerTestDeferIfFragment @defer(if: $shouldDefer, label: \"DataCheckerTestDeferIfQuery$defer$TestFragment\")\n    id\n  }\n}\n\nfragment DataCheckerTestDeferIfFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "datachecker_test_defer_if_query";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  DataCheckerTestDeferIfQuery$variables,
  DataCheckerTestDeferIfQuery$data,
>*/);
