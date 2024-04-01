/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f322b2f6615796b06a3c69377d6b5b12>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import {hello as queryHelloResolverType} from "../HelloWorldResolver.js";
// Type assertion validating that `queryHelloResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolverType: (
  args: {|
    world: string,
  |},
) => ?string);
declare export opaque type HelloWorldResolverWithProvidedVariable$fragmentType: FragmentType;
export type HelloWorldResolverWithProvidedVariable$data = {|
  +hello: ?string,
  +$fragmentType: HelloWorldResolverWithProvidedVariable$fragmentType,
|};
export type HelloWorldResolverWithProvidedVariable$key = {
  +$data?: HelloWorldResolverWithProvidedVariable$data,
  +$fragmentSpreads: HelloWorldResolverWithProvidedVariable$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__HelloWorldProviderrelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "HelloWorldResolverWithProvidedVariable",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "world",
              "variableName": "__relay_internal__pv__HelloWorldProviderrelayprovider"
            }
          ],
          "fragment": null,
          "kind": "RelayResolver",
          "name": "hello",
          "resolverModule": require('./../HelloWorldResolver').hello,
          "path": "hello"
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9f94df55099df09e6d33779b83f732fc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  HelloWorldResolverWithProvidedVariable$fragmentType,
  HelloWorldResolverWithProvidedVariable$data,
>*/);
