/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<59bc3815cfe8c597ea2f36b736f3dcad>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType: FragmentType;
export type ResolverFragmentSpreadsTestInlineFragmentSpread$data = {|
  +address: ?{|
    +city: ?string,
    +street: ?string,
  |},
  +$fragmentType: ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType,
|};
export type ResolverFragmentSpreadsTestInlineFragmentSpread$key = {
  +$data?: ResolverFragmentSpreadsTestInlineFragmentSpread$data,
  +$fragmentSpreads: ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "ResolverFragmentSpreadsTestInlineFragmentSpread"
};

if (__DEV__) {
  (node/*: any*/).hash = "d8dfd10ed770cdd5bd29d80c707ed387";
}

module.exports = ((node/*: any*/)/*: InlineFragment<
  ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType,
  ResolverFragmentSpreadsTestInlineFragmentSpread$data,
>*/);
