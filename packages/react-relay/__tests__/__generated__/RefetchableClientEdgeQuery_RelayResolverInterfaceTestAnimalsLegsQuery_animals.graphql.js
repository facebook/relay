/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0e62b4b9925d633258941706175b35de>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverInterfaceTestAnimalLegsFragment$fragmentType } from "./RelayResolverInterfaceTestAnimalLegsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals",
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
  (node/*:: as any*/).hash = "d7dcef9c5d9f2b15d2123e917f1b6c6a";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$data,
  ClientEdgeQuery_RelayResolverInterfaceTestAnimalsLegsQuery_animals$variables,
>*/);
