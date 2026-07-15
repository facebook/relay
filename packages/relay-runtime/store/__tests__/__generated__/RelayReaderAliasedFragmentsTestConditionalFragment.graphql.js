/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c14083b29133518d77615799d0470b1b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestConditionalFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
};
export type RelayReaderAliasedFragmentsTestConditionalFragment$key = {
  readonly $data?: RelayReaderAliasedFragmentsTestConditionalFragment$data,
  readonly $fragmentSpreads: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
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
  (node/*:: as any*/).hash = "12db2e04f1efe5abcf500fbf98c4748f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
  RelayReaderAliasedFragmentsTestConditionalFragment$data,
>*/);
