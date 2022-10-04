/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<88b9a538faa38a6158360c828513445d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import queryHelloResolver from "../HelloWorldResolver.js";
// Type assertion validating that `queryHelloResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolver: (
  args: {|
    world: string,
  |}, 
) => mixed);
declare export opaque type HelloWorldResolverWithProvidedVariable$fragmentType: FragmentType;
export type HelloWorldResolverWithProvidedVariable$data = {|
  +hello: ?$Call<<R>((...empty[]) => R) => R, typeof queryHelloResolver>,
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
      "name": "__relay_internal__pv__HelloWorldProviderjs"
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
              "variableName": "__relay_internal__pv__HelloWorldProviderjs"
            }
          ],
          "fragment": null,
          "kind": "RelayResolver",
          "name": "hello",
          "resolverModule": require('./../HelloWorldResolver'),
          "path": "hello"
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e248c07232d0c35862adc85efe690732";
}

module.exports = ((node/*: any*/)/*: Fragment<
  HelloWorldResolverWithProvidedVariable$fragmentType,
  HelloWorldResolverWithProvidedVariable$data,
>*/);
