/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<baf6e5a44f85c1e3d10e78be2dd4f52d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveResolversTestCounterUserFragment$fragmentType } from "./LiveResolversTestCounterUserFragment.graphql";
export type LiveResolversTestLiveResolverSuspenseQuery$variables = {|
  id: string,
|};
export type LiveResolversTestLiveResolverSuspenseQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: LiveResolversTestCounterUserFragment$fragmentType,
  |},
|};
export type LiveResolversTestLiveResolverSuspenseQuery = {|
  response: LiveResolversTestLiveResolverSuspenseQuery$data,
  variables: LiveResolversTestLiveResolverSuspenseQuery$variables,
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
    "name": "LiveResolversTestLiveResolverSuspenseQuery",
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
            "name": "LiveResolversTestCounterUserFragment"
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
    "name": "LiveResolversTestLiveResolverSuspenseQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "name": "counter_suspends_when_odd",
                    "args": null,
                    "fragment": null,
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": true
                  }
                ]
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ab51ded6f600b695c2708b9758aab010",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestLiveResolverSuspenseQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestLiveResolverSuspenseQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d8986066eeaf1dab3efb1495e3820b43";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestLiveResolverSuspenseQuery$variables,
  LiveResolversTestLiveResolverSuspenseQuery$data,
>*/);
