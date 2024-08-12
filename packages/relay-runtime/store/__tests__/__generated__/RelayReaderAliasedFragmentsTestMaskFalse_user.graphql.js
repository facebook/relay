/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b4d6e6d8f4e7fd436f0a0404aef1d37b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestMaskFalse_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestMaskFalse_user$data = {
  +name: ?string,
  ...
};
export type RelayReaderAliasedFragmentsTestMaskFalse_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestMaskFalse_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestMaskFalse_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "mask": false
  },
  "name": "RelayReaderAliasedFragmentsTestMaskFalse_user",
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
  (node/*: any*/).hash = "2cb5e389f03b34e17d3db9db0665ef62";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestMaskFalse_user$fragmentType,
  RelayReaderAliasedFragmentsTestMaskFalse_user$data,
>*/);
