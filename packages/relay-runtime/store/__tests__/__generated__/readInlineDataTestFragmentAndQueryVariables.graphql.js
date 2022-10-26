/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f24235076c8f5c2cbfd978061387f407>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestFragmentAndQueryVariables$fragmentType: FragmentType;
export type readInlineDataTestFragmentAndQueryVariables$data = {|
  +defaultVariable: ?{|
    +uri: ?string,
  |},
  +fragmentVariable: ?{|
    +uri: ?string,
  |},
  +queryVariable: ?{|
    +uri: ?string,
  |},
  +$fragmentType: readInlineDataTestFragmentAndQueryVariables$fragmentType,
|};
export type readInlineDataTestFragmentAndQueryVariables$key = {
  +$data?: readInlineDataTestFragmentAndQueryVariables$data,
  +$fragmentSpreads: readInlineDataTestFragmentAndQueryVariables$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestFragmentAndQueryVariables"
};

if (__DEV__) {
  (node/*: any*/).hash = "a43776ab4d289e45902cda8bb9553018";
}

module.exports = ((node/*: any*/)/*: InlineFragment<
  readInlineDataTestFragmentAndQueryVariables$fragmentType,
  readInlineDataTestFragmentAndQueryVariables$data,
>*/);
