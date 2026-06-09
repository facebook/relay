/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0e1141dcdae5176a7c7d907f08b5196c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Car__id$data } from "./Car__id.graphql";
import type { FragmentType } from "relay-runtime";
import {Car as carRelayModelInstanceResolverType} from "../RelayResolverMixedInterface-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `carRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(carRelayModelInstanceResolverType as (
  id: Car__id$data['id'],
  args: void,
  context: TestResolverContextType,
) => unknown);
declare export opaque type Car____relay_model_instance$fragmentType: FragmentType;
export type Car____relay_model_instance$data = {
  readonly __relay_model_instance: NonNullable<ReturnType<typeof carRelayModelInstanceResolverType>>,
  readonly $fragmentType: Car____relay_model_instance$fragmentType,
};
export type Car____relay_model_instance$key = {
  readonly $data?: Car____relay_model_instance$data,
  readonly $fragmentSpreads: Car____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Car____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "Car__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Car__id.graphql'), require('../RelayResolverMixedInterface-test').Car, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "Car",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  Car____relay_model_instance$fragmentType,
  Car____relay_model_instance$data,
>*/);
