/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3bb8ffd5fc839bf53b4f2491cd32d4be>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$data = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": [
            100
          ]
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
      "storageKey": "profilePicture(size:[100])"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0f52103d115cff3b1f20f5fc3df68230";
}

module.exports = node;
