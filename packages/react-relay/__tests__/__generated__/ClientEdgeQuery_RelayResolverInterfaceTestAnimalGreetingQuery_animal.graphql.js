/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3cd53b5892da3843edcf3ef636cdafbd>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType } from "./RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal.graphql";
export type ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$variables = {
  id: string,
};
export type ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data = {
  readonly fetch__Chicken: ?{
    readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType,
  },
};
export type ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal = {
  response: ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data,
  variables: ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$variables,
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
    "name": "ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal",
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
            "name": "RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal"
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
    "name": "ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal",
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
            "kind": "ClientExtension",
            "selections": [
              {
                "name": "greeting",
                "args": null,
                "fragment": null,
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              }
            ]
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
    "cacheID": "7f7e7c631ba959607f1f08d33335d689",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal(\n  $id: ID!\n) {\n  fetch__Chicken(input_id: $id) {\n    ...RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal on Chicken {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c574dd323e7ca1a8589783834b127925";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$variables,
  ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data,
>*/);
