/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c244439bc5e3df600a67e1c3f64edf1d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { SpecialUser____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/SpecialUser____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {data as specialUserDataResolverType} from "../../../relay-runtime/store/__tests__/resolvers/Client3DSpecialUserResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `specialUserDataResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(specialUserDataResolverType: (
  __relay_model_instance: SpecialUser____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType: FragmentType;
export type RelayClient3DModuleTestFragmentSpecialUser_data$data = {|
  +data: ?string,
  +$fragmentType: RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType,
|};
export type RelayClient3DModuleTestFragmentSpecialUser_data$key = {
  +$data?: RelayClient3DModuleTestFragmentSpecialUser_data$data,
  +$fragmentSpreads: RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayClient3DModuleTestFragmentSpecialUser_data",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "SpecialUser____relay_model_instance"
      },
      "kind": "RelayResolver",
      "name": "data",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/SpecialUser____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/Client3DSpecialUserResolvers').data, '__relay_model_instance', true),
      "path": "data"
    }
  ],
  "type": "SpecialUser",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "88c92da2147eac1c8b39d1e3a1db20ed";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType,
  RelayClient3DModuleTestFragmentSpecialUser_data$data,
>*/);
