/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9b08fc2ffa40f64453c61726b8d0adfc>>
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
export type RelayReaderRequiredFieldsTest6Fragment$data = ReadonlyArray<?{|
  +username: string,
  +$fragmentType: RelayReaderRequiredFieldsTest6Fragment$fragmentType,
|}>;
export type RelayReaderRequiredFieldsTest6Fragment$key = ReadonlyArray<{
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
      "action": "LOG"
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
