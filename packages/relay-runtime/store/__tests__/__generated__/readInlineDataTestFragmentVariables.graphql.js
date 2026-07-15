/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9928c5edd27b1f13eb50ccad38c84578>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestFragmentVariables$fragmentType: FragmentType;
export type readInlineDataTestFragmentVariables$data = {
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: readInlineDataTestFragmentVariables$fragmentType,
};
export type readInlineDataTestFragmentVariables$key = {
  readonly $data?: readInlineDataTestFragmentVariables$data,
  readonly $fragmentSpreads: readInlineDataTestFragmentVariables$fragmentType,
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
