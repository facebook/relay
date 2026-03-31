/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9b81a0600d677243b7fd94a57bf1c48e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestInline_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestInline_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestInline_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestInline_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestInline_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestInline_user$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "RelayReaderAliasedFragmentsTestInline_user"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "02c55d13cce63c4ff8d54c30661371f3";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  RelayReaderAliasedFragmentsTestInline_user$fragmentType,
  RelayReaderAliasedFragmentsTestInline_user$data,
>*/);
