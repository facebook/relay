/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e7bac295f7c6bd269faa5d53ee4c85b2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest5Fragment$ref: FragmentReference;
declare export opaque type RelayReaderRequiredFieldsTest5Fragment$fragmentType: RelayReaderRequiredFieldsTest5Fragment$ref;
export type RelayReaderRequiredFieldsTest5Fragment = ?{|
  +firstName: ?string,
  +username: string,
  +$refType: RelayReaderRequiredFieldsTest5Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest5Fragment$data = RelayReaderRequiredFieldsTest5Fragment;
export type RelayReaderRequiredFieldsTest5Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest5Fragment$data,
  +$fragmentRefs: RelayReaderRequiredFieldsTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "c56ee2978a8438f397e5d360fa9da504";
}

module.exports = node;
