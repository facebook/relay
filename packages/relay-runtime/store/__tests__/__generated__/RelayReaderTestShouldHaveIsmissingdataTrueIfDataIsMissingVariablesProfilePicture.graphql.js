/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1391d9f98bee08600dd473185125ef29>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$ref = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data = {|
  +id: string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data,
  +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "334687995a9fc9bcffcf910de7cec596";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data,
>*/);
