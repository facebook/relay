/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b3fefaa55a3152e7e49fad51e68c3c2b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestFragmentVariables$fragmentType: FragmentType;
export type readInlineDataTestFragmentVariables$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: readInlineDataTestFragmentVariables$fragmentType,
|};
export type readInlineDataTestFragmentVariables$key = {
  +$data?: readInlineDataTestFragmentVariables$data,
  +$fragmentSpreads: readInlineDataTestFragmentVariables$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestFragmentVariables"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "232456d8209f3e1dbaa16f6f7a77945c";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  readInlineDataTestFragmentVariables$fragmentType,
  readInlineDataTestFragmentVariables$data,
>*/);
