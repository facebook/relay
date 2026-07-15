/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e5b55c77d03f3f214d619e9555cc3d5f>>
 * @flow
 * @lightSyntaxTransform
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
(todoSelfResolverType as (
  rootKey: TodoSelfResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
declare export opaque type TodoBlockedByResolverFragment$fragmentType: FragmentType;
export type TodoBlockedByResolverFragment$data = {
  readonly self: ?ReturnType<ReturnType<typeof todoSelfResolverType>["read"]>,
  readonly $fragmentType: TodoBlockedByResolverFragment$fragmentType,
};
export type TodoBlockedByResolverFragment$key = {
  readonly $data?: TodoBlockedByResolverFragment$data,
  readonly $fragmentSpreads: TodoBlockedByResolverFragment$fragmentType,
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
  (node/*:: as any*/).hash = "d610c98781a955eccdd5d1c43b70ce48";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  TodoBlockedByResolverFragment$fragmentType,
  TodoBlockedByResolverFragment$data,
>*/);
