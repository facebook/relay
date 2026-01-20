/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c95f68cf864ac2e828cc3a1588a43726>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { SpecialUser__id$data } from "./SpecialUser__id.graphql";
import type { FragmentType } from "relay-runtime";
import {SpecialUser as specialUserRelayModelInstanceResolverType} from "../Client3DSpecialUserResolvers.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `specialUserRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(specialUserRelayModelInstanceResolverType: (
  id: SpecialUser__id$data['id'],
  args: void,
  context: TestResolverContextType,
) => unknown);
declare export opaque type SpecialUser____relay_model_instance$fragmentType: FragmentType;
export type SpecialUser____relay_model_instance$data = {|
  +__relay_model_instance: NonNullable<ReturnType<typeof specialUserRelayModelInstanceResolverType>>,
  +$fragmentType: SpecialUser____relay_model_instance$fragmentType,
|};
export type SpecialUser____relay_model_instance$key = {
  +$data?: SpecialUser____relay_model_instance$data,
  +$fragmentSpreads: SpecialUser____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SpecialUser____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "SpecialUser__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./SpecialUser__id.graphql'), require('../Client3DSpecialUserResolvers').SpecialUser, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "SpecialUser",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  SpecialUser____relay_model_instance$fragmentType,
  SpecialUser____relay_model_instance$data,
>*/);
