/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<02dbfa9d5c94934e8f7126efea687cb5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest1Fragment$ref: FragmentReference;
declare export opaque type RelayReaderRequiredFieldsTest1Fragment$fragmentType: RelayReaderRequiredFieldsTest1Fragment$ref;
export type RelayReaderRequiredFieldsTest1Fragment = ?{|
  +lastName: string,
  +$refType: RelayReaderRequiredFieldsTest1Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest1Fragment$data = RelayReaderRequiredFieldsTest1Fragment;
export type RelayReaderRequiredFieldsTest1Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest1Fragment$data,
  +$fragmentRefs: RelayReaderRequiredFieldsTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest1Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lastName",
        "storageKey": null
      },
      "action": "LOG",
      "path": "lastName"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5c895b4bf852db5d7ba990fef64eee3f";
}

module.exports = node;
