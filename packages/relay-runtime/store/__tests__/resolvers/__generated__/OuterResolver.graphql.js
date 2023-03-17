/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d4712cf279cee8b8411d43c89431674e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { InnerResolver$key } from "./InnerResolver.graphql";
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import {inner as queryInnerResolverType} from "../InnerResolver.js";
// Type assertion validating that `queryInnerResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryInnerResolverType: (
  rootKey: InnerResolver$key,
) => LiveState<mixed>);
declare export opaque type OuterResolver$fragmentType: FragmentType;
export type OuterResolver$data = {|
  +inner: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryInnerResolverType>["read"]>,
  +$fragmentType: OuterResolver$fragmentType,
|};
export type OuterResolver$key = {
  +$data?: OuterResolver$data,
  +$fragmentSpreads: OuterResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OuterResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "InnerResolver"
      },
      "kind": "RelayLiveResolver",
      "name": "inner",
      "resolverModule": require('./../InnerResolver').inner,
      "path": "inner"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "95e62e0f7574f311e930c3bad24ff822";
}

module.exports = ((node/*: any*/)/*: Fragment<
  OuterResolver$fragmentType,
  OuterResolver$data,
>*/);
