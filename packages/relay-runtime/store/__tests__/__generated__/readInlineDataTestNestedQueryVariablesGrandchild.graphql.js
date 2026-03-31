/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<78faeb9117877743f1bfc821026c081a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestNestedQueryVariablesGrandchild$fragmentType: FragmentType;
export type readInlineDataTestNestedQueryVariablesGrandchild$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: readInlineDataTestNestedQueryVariablesGrandchild$fragmentType,
|};
export type readInlineDataTestNestedQueryVariablesGrandchild$key = {
  +$data?: readInlineDataTestNestedQueryVariablesGrandchild$data,
  +$fragmentSpreads: readInlineDataTestNestedQueryVariablesGrandchild$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestNestedQueryVariablesGrandchild"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "88f25320204f0e57533953badb8c3928";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  readInlineDataTestNestedQueryVariablesGrandchild$fragmentType,
  readInlineDataTestNestedQueryVariablesGrandchild$data,
>*/);
