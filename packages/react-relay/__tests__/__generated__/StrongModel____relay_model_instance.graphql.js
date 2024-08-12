/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6ca8a3debc72d7878740566e5d5bf0f1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { StrongModel__id$data } from "./StrongModel__id.graphql";
import type { FragmentType } from "relay-runtime";
import {StrongModel as strongModelRelayModelInstanceResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestLiveResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestLiveResolverContextType";
// Type assertion validating that `strongModelRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(strongModelRelayModelInstanceResolverType: (
  id: StrongModel__id$data['id'],
  args: void,
  context: TestLiveResolverContextType,
) => mixed);
declare export opaque type StrongModel____relay_model_instance$fragmentType: FragmentType;
export type StrongModel____relay_model_instance$data = {|
  +__relay_model_instance: $NonMaybeType<ReturnType<typeof strongModelRelayModelInstanceResolverType>>,
  +$fragmentType: StrongModel____relay_model_instance$fragmentType,
|};
export type StrongModel____relay_model_instance$key = {
  +$data?: StrongModel____relay_model_instance$data,
  +$fragmentSpreads: StrongModel____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StrongModel____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "StrongModel__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./StrongModel__id.graphql'), require('./../RelayResolverNullableModelClientEdge-test').StrongModel, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "StrongModel",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  StrongModel____relay_model_instance$fragmentType,
  StrongModel____relay_model_instance$data,
>*/);
