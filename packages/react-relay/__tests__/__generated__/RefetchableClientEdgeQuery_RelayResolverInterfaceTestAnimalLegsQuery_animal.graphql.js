/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7c2fb19ac4b1f049d9cdf30adfce5124>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverInterfaceTestAnimalLegsFragment$fragmentType } from "./RelayResolverInterfaceTestAnimalLegsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "fetch__Chicken"
      ],
      "operation": require('./ClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayResolverInterfaceTestAnimalLegsFragment"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Chicken",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f98a683fd9222f08fa9698ca1f4b553d";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$data,
  ClientEdgeQuery_RelayResolverInterfaceTestAnimalLegsQuery_animal$variables,
>*/);
