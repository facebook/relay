/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c0b70a44571ca05c65ab7c5f41439535>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile = {|
  +id: string,
  +name: ?string,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref,
  +$refType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref,
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
  "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile",
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
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1f320a4cef6478336086b37f5db239ee";
}

module.exports = node;
