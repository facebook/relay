/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c0adf5ad88a890771f3f564f86dcb99c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest5Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest5Fragment$ref = RelayReaderRequiredFieldsTest5Fragment$fragmentType;
export type RelayReaderRequiredFieldsTest5Fragment$data = ?{|
  +firstName: ?string,
  +username: string,
  +$fragmentType: RelayReaderRequiredFieldsTest5Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest5Fragment = RelayReaderRequiredFieldsTest5Fragment$data;
export type RelayReaderRequiredFieldsTest5Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest5Fragment$data,
  +$fragmentSpreads: RelayReaderRequiredFieldsTest5Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderRequiredFieldsTest5Fragment$fragmentType,
  RelayReaderRequiredFieldsTest5Fragment$data,
>*/);
