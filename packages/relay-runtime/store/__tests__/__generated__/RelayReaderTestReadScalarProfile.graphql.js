/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4f360a78259f5ee0f39b9dc71ed07202>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadScalarProfile$fragmentType: FragmentType;
export type RelayReaderTestReadScalarProfile$data = {|
  +id: string,
  +$fragmentType: RelayReaderTestReadScalarProfile$fragmentType,
|};
export type RelayReaderTestReadScalarProfile$key = {
  +$data?: RelayReaderTestReadScalarProfile$data,
  +$fragmentSpreads: RelayReaderTestReadScalarProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadScalarProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "568b33ad407adb1c329bfcaf3c152667";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestReadScalarProfile$fragmentType,
  RelayReaderTestReadScalarProfile$data,
>*/);
