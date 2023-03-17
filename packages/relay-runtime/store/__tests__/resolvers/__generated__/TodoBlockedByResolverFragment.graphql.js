/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0ef603cdad4a83418167ae3aeaa07aa7>>
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
import {self as todoSelfResolverType} from "../TodoSelfResolver.js";
// Type assertion validating that `todoSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoSelfResolverType: (
  rootKey: TodoSelfResolverFragment$key,
) => LiveState<mixed>);
declare export opaque type TodoBlockedByResolverFragment$fragmentType: FragmentType;
export type TodoBlockedByResolverFragment$data = {|
  +self: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof todoSelfResolverType>["read"]>,
  +$fragmentType: TodoBlockedByResolverFragment$fragmentType,
|};
export type TodoBlockedByResolverFragment$key = {
  +$data?: TodoBlockedByResolverFragment$data,
  +$fragmentSpreads: TodoBlockedByResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoBlockedByResolverFragment",
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
      "resolverModule": require('./../TodoSelfResolver').self,
      "path": "self"
    }
  ],
  "type": "Todo",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d610c98781a955eccdd5d1c43b70ce48";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoBlockedByResolverFragment$fragmentType,
  TodoBlockedByResolverFragment$data,
>*/);
