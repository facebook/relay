/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dbd533e9ffdb58b2de9a321639beca1b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import {field_that_throws as queryFieldThatThrowsResolverType} from "../useFragment_nullability-test.js";
import type { TestResolverContextType } from "../../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryFieldThatThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryFieldThatThrowsResolverType as (
  args: void,
  context: TestResolverContextType,
) => number);
declare export opaque type useFragmentNullabilityTestFragmentWithFieldThatThrows$fragmentType: FragmentType;
export type useFragmentNullabilityTestFragmentWithFieldThatThrows$data = {
  readonly field_that_throws: number,
  readonly $fragmentType: useFragmentNullabilityTestFragmentWithFieldThatThrows$fragmentType,
};
export type useFragmentNullabilityTestFragmentWithFieldThatThrows$key = {
  readonly $data?: useFragmentNullabilityTestFragmentWithFieldThatThrows$data,
  readonly $fragmentSpreads: useFragmentNullabilityTestFragmentWithFieldThatThrows$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "useFragmentNullabilityTestFragmentWithFieldThatThrows",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "field_that_throws",
          "resolverModule": require('../useFragment_nullability-test').field_that_throws,
          "path": "field_that_throws"
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "dea9fca9b23eeb0d2dccfe5c68da7c2c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentNullabilityTestFragmentWithFieldThatThrows$fragmentType,
  useFragmentNullabilityTestFragmentWithFieldThatThrows$data,
>*/);
