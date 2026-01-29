/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8ccda0e6400fbe28467e1480ff53c72f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoTextColorResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoTextColorResolverFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {human_readable_color as todoTextColorHumanReadableColorResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoTextColorResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `todoTextColorHumanReadableColorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoTextColorHumanReadableColorResolverType: (
  rootKey: TodoTextColorResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType: FragmentType;
export type RelayResolversWithOutputTypeTestTextColorComponentFragment$data = {|
  +human_readable_color: ?string,
  +$fragmentType: RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType,
|};
export type RelayResolversWithOutputTypeTestTextColorComponentFragment$key = {
  +$data?: RelayResolversWithOutputTypeTestTextColorComponentFragment$data,
  +$fragmentSpreads: RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolversWithOutputTypeTestTextColorComponentFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "TodoTextColorResolverFragment"
      },
      "kind": "RelayResolver",
      "name": "human_readable_color",
      "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/TodoTextColorResolver').human_readable_color,
      "path": "human_readable_color"
    }
  ],
  "type": "TodoTextColor",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d236248a49dbfef90d13bc458b58a7f5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType,
  RelayResolversWithOutputTypeTestTextColorComponentFragment$data,
>*/);
