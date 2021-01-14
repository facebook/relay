/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5791a981e717513596d2ce7d9790bbf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestReadScalarProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestReadScalarProfile$fragmentType: RelayReaderTestReadScalarProfile$ref;
export type RelayReaderTestReadScalarProfile = {|
  +id: string,
  +$refType: RelayReaderTestReadScalarProfile$ref,
|};
export type RelayReaderTestReadScalarProfile$data = RelayReaderTestReadScalarProfile;
export type RelayReaderTestReadScalarProfile$key = {
  +$data?: RelayReaderTestReadScalarProfile$data,
  +$fragmentRefs: RelayReaderTestReadScalarProfile$ref,
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

module.exports = node;
