/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43f61d60d326a9969d11c793eb4e018d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestConditionalFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestConditionalFragment$key = {
  +$data?: RelayReaderAliasedFragmentsTestConditionalFragment$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestConditionalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "12db2e04f1efe5abcf500fbf98c4748f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
  RelayReaderAliasedFragmentsTestConditionalFragment$data,
>*/);
