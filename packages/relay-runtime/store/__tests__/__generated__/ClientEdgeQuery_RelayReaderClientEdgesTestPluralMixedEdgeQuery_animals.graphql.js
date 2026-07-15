/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3af4ffc03060ba04cb4d0ab24c5698a2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals.graphql";
export type ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$variables = {
  id: string,
};
export type ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data = {
  readonly fetch__Chicken: ?{
    readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType,
  },
};
export type ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals = {
  response: ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data,
  variables: ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$variables,
};
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
    "name": "input_id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Chicken",
        "kind": "LinkedField",
        "name": "fetch__Chicken",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals"
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
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Chicken",
        "kind": "LinkedField",
        "name": "fetch__Chicken",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "legs",
            "storageKey": null
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
    "cacheID": "9b97eb80b31a16f76ab259f9ef7343a3",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals(\n  $id: ID!\n) {\n  fetch__Chicken(input_id: $id) {\n    ...RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals on Chicken {\n  legs\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c269150bc8b81e02f100dad3641bbd60";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$variables,
  ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data,
>*/);
