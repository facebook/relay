/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a9b3bd4b6d3e996717ddad3b0e7ddc25>>
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
declare export opaque type TodoBlockedByResolverFragment$fragmentType: FragmentType;
export type TodoBlockedByResolverFragment$data = {|
  +self: ?ReturnType<ReturnType<typeof todoSelfResolverType>["read"]>,
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
      "resolverModule": require('../TodoSelfResolver').self,
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
