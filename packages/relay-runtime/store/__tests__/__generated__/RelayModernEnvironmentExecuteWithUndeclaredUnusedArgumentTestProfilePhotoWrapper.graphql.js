/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<61524ef03d1bce22f296e5c9bc7ecabc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$ref = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data = {|
  +__typename: "User",
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType,
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$data,
>*/);
