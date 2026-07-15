/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<796a6fa687ff4a459692933ce3851005>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Hovercraft__id$data } from "./Hovercraft__id.graphql";
import type { FragmentType } from "relay-runtime";
import {Hovercraft as hovercraftRelayModelInstanceResolverType} from "../RelayResolverMixedUnionFetchable-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `hovercraftRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(hovercraftRelayModelInstanceResolverType as (
  id: Hovercraft__id$data['id'],
  args: void,
  context: TestResolverContextType,
) => unknown);
declare export opaque type Hovercraft____relay_model_instance$fragmentType: FragmentType;
export type Hovercraft____relay_model_instance$data = {
  readonly __relay_model_instance: NonNullable<ReturnType<typeof hovercraftRelayModelInstanceResolverType>>,
  readonly $fragmentType: Hovercraft____relay_model_instance$fragmentType,
};
export type Hovercraft____relay_model_instance$key = {
  readonly $data?: Hovercraft____relay_model_instance$data,
  readonly $fragmentSpreads: Hovercraft____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Hovercraft____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "Hovercraft__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Hovercraft__id.graphql'), require('../RelayResolverMixedUnionFetchable-test').Hovercraft, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "Hovercraft",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  Hovercraft____relay_model_instance$fragmentType,
  Hovercraft____relay_model_instance$data,
>*/);
