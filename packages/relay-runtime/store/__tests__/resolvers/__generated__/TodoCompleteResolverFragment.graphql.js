/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a06597ae0d72e9d87bb357d671614921>>
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
declare export opaque type TodoCompleteResolverFragment$fragmentType: FragmentType;
export type TodoCompleteResolverFragment$data = {|
  +self: ?ReturnType<ReturnType<typeof todoSelfResolverType>["read"]>,
  +$fragmentType: TodoCompleteResolverFragment$fragmentType,
|};
export type TodoCompleteResolverFragment$key = {
  +$data?: TodoCompleteResolverFragment$data,
  +$fragmentSpreads: TodoCompleteResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoCompleteResolverFragment",
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
  (node/*: any*/).hash = "38d40c980b2c5c00102b3db9e9615561";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoCompleteResolverFragment$fragmentType,
  TodoCompleteResolverFragment$data,
>*/);
