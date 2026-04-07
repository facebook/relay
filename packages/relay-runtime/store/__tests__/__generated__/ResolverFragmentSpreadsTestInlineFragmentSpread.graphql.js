/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3d88ebe9a425d30ba49c7cf49e57a760>>
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
  (node/*:: as any*/).hash = "d8dfd10ed770cdd5bd29d80c707ed387";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType,
  ResolverFragmentSpreadsTestInlineFragmentSpread$data,
>*/);
