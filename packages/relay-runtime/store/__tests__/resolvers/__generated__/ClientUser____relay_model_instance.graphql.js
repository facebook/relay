/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b0edf784dfe129a59dc8c20a4fee5169>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ClientUser__id$data } from "./ClientUser__id.graphql";
import type { FragmentType } from "relay-runtime";
import {ClientUser as clientUserRelayModelInstanceResolverType} from "../Client3DClientUserResolvers.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `clientUserRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(clientUserRelayModelInstanceResolverType as (
  id: ClientUser__id$data['id'],
  args: void,
  context: TestResolverContextType,
) => unknown);
declare export opaque type ClientUser____relay_model_instance$fragmentType: FragmentType;
export type ClientUser____relay_model_instance$data = {
  readonly __relay_model_instance: NonNullable<ReturnType<typeof clientUserRelayModelInstanceResolverType>>,
  readonly $fragmentType: ClientUser____relay_model_instance$fragmentType,
};
export type ClientUser____relay_model_instance$key = {
  readonly $data?: ClientUser____relay_model_instance$data,
  readonly $fragmentSpreads: ClientUser____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientUser____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ClientUser__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./ClientUser__id.graphql'), require('../Client3DClientUserResolvers').ClientUser, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "ClientUser",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ClientUser____relay_model_instance$fragmentType,
  ClientUser____relay_model_instance$data,
>*/);
