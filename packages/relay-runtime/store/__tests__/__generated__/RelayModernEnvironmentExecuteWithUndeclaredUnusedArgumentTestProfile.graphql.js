/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b6860ab30bfeaae0ce95ba7b283f16e4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data = {|
  +id: string,
  +name: ?string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile = RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data,
>*/);
