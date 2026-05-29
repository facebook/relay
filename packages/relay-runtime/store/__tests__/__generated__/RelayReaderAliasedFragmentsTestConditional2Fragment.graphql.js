/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1f4b040a5523a0c25d42f36982f502c3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestConditional2Fragment$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
};
export type RelayReaderAliasedFragmentsTestConditional2Fragment$key = {
  readonly $data?: RelayReaderAliasedFragmentsTestConditional2Fragment$data,
  readonly $fragmentSpreads: RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestConditional2Fragment",
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
  (node/*:: as any*/).hash = "da47c7d96012f84b35aa45d5fb33b715";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
  RelayReaderAliasedFragmentsTestConditional2Fragment$data,
>*/);
