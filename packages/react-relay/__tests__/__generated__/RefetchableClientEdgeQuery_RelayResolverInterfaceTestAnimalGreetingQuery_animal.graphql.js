/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c6ce497ef0d72511af6f83fb253ec3e9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { Cat____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Cat____relay_model_instance.graphql";
import type { Fish____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Fish____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {greeting as iAnimalGreetingResolverType} from "../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `iAnimalGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(iAnimalGreetingResolverType as (
  model: Cat____relay_model_instance$data['__relay_model_instance'] | Fish____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data = {
  readonly greeting: ?string,
  readonly id: string,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "greeting",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers').greeting,
          "path": "greeting"
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
  "type": "Chicken",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "c574dd323e7ca1a8589783834b127925";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$data,
  ClientEdgeQuery_RelayResolverInterfaceTestAnimalGreetingQuery_animal$variables,
>*/);
