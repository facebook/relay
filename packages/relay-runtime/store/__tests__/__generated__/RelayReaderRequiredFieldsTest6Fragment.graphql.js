/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b3065d19a50d402dd15b6e011e5ebfda>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest6Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest6Fragment$data = $ReadOnlyArray<?{|
  +username: string,
  +$fragmentType: RelayReaderRequiredFieldsTest6Fragment$fragmentType,
|}>;
export type RelayReaderRequiredFieldsTest6Fragment$key = $ReadOnlyArray<{
  +$data?: RelayReaderRequiredFieldsTest6Fragment$data,
  +$fragmentSpreads: RelayReaderRequiredFieldsTest6Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RelayReaderRequiredFieldsTest6Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      },
      "action": "LOG",
      "path": "username"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "bdda7f856891c1faba4a6392d5ea209c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderRequiredFieldsTest6Fragment$fragmentType,
  RelayReaderRequiredFieldsTest6Fragment$data,
>*/);
