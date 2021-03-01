/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bed55ede71e82e7e8cfe5eaaffe3a949>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$ref;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture = {|
  +id: string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePicture$ref,
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

module.exports = node;
