/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<49200f09692d2c499f661848b5e7c445>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoCompleteResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoCompleteResolverFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {complete as todoCompleteResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoCompleteResolver.js";
// Type assertion validating that `todoCompleteResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoCompleteResolverType: (
  rootKey: TodoCompleteResolverFragment$key,
) => ?mixed);
declare export opaque type RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType: FragmentType;
export type RelayResolversWithOutputTypeTestTodoCompleteFragment$data = {|
  +complete: ?ReturnType<typeof todoCompleteResolverType>,
  +$fragmentType: RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType,
|};
export type RelayResolversWithOutputTypeTestTodoCompleteFragment$key = {
  +$data?: RelayResolversWithOutputTypeTestTodoCompleteFragment$data,
  +$fragmentSpreads: RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolversWithOutputTypeTestTodoCompleteFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "TodoCompleteResolverFragment"
      },
      "kind": "RelayResolver",
      "name": "complete",
      "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/TodoCompleteResolver').complete,
      "path": "complete"
    }
  ],
  "type": "Todo",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1aaa83d77ddf1c6f117c512c48a014e4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType,
  RelayResolversWithOutputTypeTestTodoCompleteFragment$data,
>*/);
