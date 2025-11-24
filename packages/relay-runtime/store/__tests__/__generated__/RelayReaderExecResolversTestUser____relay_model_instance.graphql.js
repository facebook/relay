/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3353783e9ee116d87f60539a455c4bb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReaderExecResolversTestUser__id$data } from "./RelayReaderExecResolversTestUser__id.graphql";
import type { FragmentType } from "relay-runtime";
import {RelayReaderExecResolversTestUser as relayReaderExecResolversTestUserRelayModelInstanceResolverType} from "../RelayReader-ExecResolvers-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `relayReaderExecResolversTestUserRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(relayReaderExecResolversTestUserRelayModelInstanceResolverType: (
  id: RelayReaderExecResolversTestUser__id$data['id'],
  args: void,
  context: TestResolverContextType,
) => unknown);
declare export opaque type RelayReaderExecResolversTestUser____relay_model_instance$fragmentType: FragmentType;
export type RelayReaderExecResolversTestUser____relay_model_instance$data = {|
  +__relay_model_instance: NonNullable<ReturnType<typeof relayReaderExecResolversTestUserRelayModelInstanceResolverType>>,
  +$fragmentType: RelayReaderExecResolversTestUser____relay_model_instance$fragmentType,
|};
export type RelayReaderExecResolversTestUser____relay_model_instance$key = {
  +$data?: RelayReaderExecResolversTestUser____relay_model_instance$data,
  +$fragmentSpreads: RelayReaderExecResolversTestUser____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderExecResolversTestUser____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderExecResolversTestUser__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser__id.graphql'), require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "RelayReaderExecResolversTestUser",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderExecResolversTestUser____relay_model_instance$fragmentType,
  RelayReaderExecResolversTestUser____relay_model_instance$data,
>*/);
