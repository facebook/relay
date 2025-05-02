/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1b84f5463d8cb4f862ba0f2c066dafa8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ClientUser____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/ClientUser____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {data as clientUserDataResolverType} from "../../../relay-runtime/store/__tests__/resolvers/Client3DClientUserResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `clientUserDataResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(clientUserDataResolverType: (
  __relay_model_instance: ClientUser____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RelayClient3DModuleTestFragmentClientUser_data$fragmentType: FragmentType;
export type RelayClient3DModuleTestFragmentClientUser_data$data = {|
  +data: ?string,
  +$fragmentType: RelayClient3DModuleTestFragmentClientUser_data$fragmentType,
|};
export type RelayClient3DModuleTestFragmentClientUser_data$key = {
  +$data?: RelayClient3DModuleTestFragmentClientUser_data$data,
  +$fragmentSpreads: RelayClient3DModuleTestFragmentClientUser_data$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayClient3DModuleTestFragmentClientUser_data",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ClientUser____relay_model_instance"
      },
      "kind": "RelayResolver",
      "name": "data",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/ClientUser____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/Client3DClientUserResolvers').data, '__relay_model_instance', true),
      "path": "data"
    }
  ],
  "type": "ClientUser",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "adbab56e5ede85b3aa2d238188eef45e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayClient3DModuleTestFragmentClientUser_data$fragmentType,
  RelayClient3DModuleTestFragmentClientUser_data$data,
>*/);
