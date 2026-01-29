/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d2d429917f57d8b83d435b843a105f5c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoSelfResolverFragment$key } from "./TodoSelfResolverFragment.graphql";
import type { LiveState, FragmentType } from "relay-runtime";
import {self as todoSelfResolverType} from "../TodoSelfResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `todoSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoSelfResolverType: (
  rootKey: TodoSelfResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
declare export opaque type TodoTextResolverFragment$fragmentType: FragmentType;
export type TodoTextResolverFragment$data = {|
  +self: ?ReturnType<ReturnType<typeof todoSelfResolverType>["read"]>,
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
      "resolverModule": require('../TodoSelfResolver').self,
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
