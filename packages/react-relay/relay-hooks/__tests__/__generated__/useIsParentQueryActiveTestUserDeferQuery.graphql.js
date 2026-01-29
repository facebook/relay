/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f973067f732b33451b766435a8421471>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useIsParentQueryActiveTestUserFragment$fragmentType } from "./useIsParentQueryActiveTestUserFragment.graphql";
export type useIsParentQueryActiveTestUserDeferQuery$variables = {|
  id: string,
|};
export type useIsParentQueryActiveTestUserDeferQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useIsParentQueryActiveTestUserFragment$fragmentType,
  |},
|};
export type useIsParentQueryActiveTestUserDeferQuery = {|
  response: useIsParentQueryActiveTestUserDeferQuery$data,
  variables: useIsParentQueryActiveTestUserDeferQuery$variables,
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
    "name": "useIsParentQueryActiveTestUserDeferQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useIsParentQueryActiveTestUserFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useIsParentQueryActiveTestUserDeferQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "useIsParentQueryActiveTestUserDeferQuery$defer$useIsParentQueryActiveTestUserFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
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
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5765ccca1b237ff76e61d8e528f2a265",
    "id": null,
    "metadata": {},
    "name": "useIsParentQueryActiveTestUserDeferQuery",
    "operationKind": "query",
    "text": "query useIsParentQueryActiveTestUserDeferQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useIsParentQueryActiveTestUserFragment @defer(label: \"useIsParentQueryActiveTestUserDeferQuery$defer$useIsParentQueryActiveTestUserFragment\")\n    id\n  }\n}\n\nfragment useIsParentQueryActiveTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "567eaed2bb0068576063e236f9b4560a";
}

module.exports = ((node/*: any*/)/*: Query<
  useIsParentQueryActiveTestUserDeferQuery$variables,
  useIsParentQueryActiveTestUserDeferQuery$data,
>*/);
