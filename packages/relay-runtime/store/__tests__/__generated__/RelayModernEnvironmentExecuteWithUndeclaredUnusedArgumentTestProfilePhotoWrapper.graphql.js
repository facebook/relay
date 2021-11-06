/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ee5c909cd336796e885a2332060737a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper = {|
  +__typename: "User",
  +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$ref,
  +$refType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
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
      "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "323ad5748c20591d3eea547385d3c4d8";
}

module.exports = node;
