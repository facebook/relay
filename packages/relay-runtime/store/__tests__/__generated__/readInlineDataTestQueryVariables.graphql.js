/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<946dcc6add9f5d12deaacda0d42aa96b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestQueryVariables$fragmentType: FragmentType;
export type readInlineDataTestQueryVariables$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: readInlineDataTestQueryVariables$fragmentType,
|};
export type readInlineDataTestQueryVariables$key = {
  +$data?: readInlineDataTestQueryVariables$data,
  +$fragmentSpreads: readInlineDataTestQueryVariables$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestQueryVariables"
};

if (__DEV__) {
  (node/*: any*/).hash = "1377d31be0006404973e0320af72c9c4";
}

module.exports = ((node/*: any*/)/*: InlineFragment<
  readInlineDataTestQueryVariables$fragmentType,
  readInlineDataTestQueryVariables$data,
>*/);
