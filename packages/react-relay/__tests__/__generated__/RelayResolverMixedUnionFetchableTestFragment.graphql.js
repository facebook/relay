/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<71eee5c30f15a943a6649d2d3dbf485b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Hovercraft____relay_model_instance$data } from "./Hovercraft____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {description as hovercraftDescriptionResolverType} from "../RelayResolverMixedUnionFetchable-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `hovercraftDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(hovercraftDescriptionResolverType as (
  __relay_model_instance: Hovercraft____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RelayResolverMixedUnionFetchableTestFragment$fragmentType: FragmentType;
export type RelayResolverMixedUnionFetchableTestFragment$data = {
  readonly __typename: "Hovercraft",
  readonly description: ?string,
  readonly $fragmentType: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
} | {
  readonly __typename: "NonNodeStory",
  readonly tracking: ?string,
  readonly $fragmentType: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other",
  readonly $fragmentType: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
};
export type RelayResolverMixedUnionFetchableTestFragment$key = {
  readonly $data?: RelayResolverMixedUnionFetchableTestFragment$data,
  readonly $fragmentSpreads: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverMixedUnionFetchableTestFragment",
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tracking",
          "storageKey": null
        }
      ],
      "type": "NonNodeStory",
      "abstractKey": null
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Hovercraft____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "description",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Hovercraft____relay_model_instance.graphql'), require('../RelayResolverMixedUnionFetchable-test').description, '__relay_model_instance', true),
              "path": "description"
            }
          ],
          "type": "Hovercraft",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "MixedVehicle",
  "abstractKey": "__isMixedVehicle"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "de050fe01ddbccd1439c0151d67d4779";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResolverMixedUnionFetchableTestFragment$fragmentType,
  RelayResolverMixedUnionFetchableTestFragment$data,
>*/);
