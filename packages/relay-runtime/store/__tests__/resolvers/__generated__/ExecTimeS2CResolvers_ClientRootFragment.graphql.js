/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a19e551e01d6d089757a935b475285cf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import {hello_optional_world as queryHelloOptionalWorldResolverType} from "../HelloWorldOptionalResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloOptionalWorldResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloOptionalWorldResolverType as (
  args: {
    world: ?string,
  },
  context: TestResolverContextType,
) => ?string);
declare export opaque type ExecTimeS2CResolvers_ClientRootFragment$fragmentType: FragmentType;
export type ExecTimeS2CResolvers_ClientRootFragment$data = {
  readonly hello_optional_world: ?string,
  readonly $fragmentType: ExecTimeS2CResolvers_ClientRootFragment$fragmentType,
};
export type ExecTimeS2CResolvers_ClientRootFragment$key = {
  readonly $data?: ExecTimeS2CResolvers_ClientRootFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CResolvers_ClientRootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CResolvers_ClientRootFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": [],
          "fragment": null,
          "kind": "RelayResolver",
          "name": "hello_optional_world",
          "resolverModule": require('../HelloWorldOptionalResolver').hello_optional_world,
          "path": "hello_optional_world"
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "abf3143e7ec3a9add87a8b21944695ad";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CResolvers_ClientRootFragment$fragmentType,
  ExecTimeS2CResolvers_ClientRootFragment$data,
>*/);
