/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<de98619216e9690a556972b5d0bec086>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoSelfResolverFragment$key } from "./TodoSelfResolverFragment.graphql";
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import todoSelfResolver from "../TodoSelfResolver.js";
// Type assertion validating that `todoSelfResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoSelfResolver: (
  rootKey: TodoSelfResolverFragment$key, 
) => LiveState<any>);
declare export opaque type TodoTextResolverFragment$fragmentType: FragmentType;
export type TodoTextResolverFragment$data = {|
  +self: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof todoSelfResolver>["read"]>,
  +$fragmentType: TodoTextResolverFragment$fragmentType,
|};
export type TodoTextResolverFragment$key = {
  +$data?: TodoTextResolverFragment$data,
  +$fragmentSpreads: TodoTextResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoTextResolverFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "TodoSelfResolverFragment"
      },
      "kind": "RelayLiveResolver",
      "name": "self",
      "resolverModule": require('./../TodoSelfResolver'),
      "path": "self"
    }
  ],
  "type": "Todo",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "825ea3b21e9b9c4edf4633dae8276c4f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoTextResolverFragment$fragmentType,
  TodoTextResolverFragment$data,
>*/);
