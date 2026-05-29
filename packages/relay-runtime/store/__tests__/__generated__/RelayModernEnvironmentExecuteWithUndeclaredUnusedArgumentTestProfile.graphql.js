/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<15ccff7181ef6a999470df42b9a7d22a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType } from "./RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
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
  (node/*:: as any*/).hash = "1f320a4cef6478336086b37f5db239ee";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$fragmentType,
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$data,
>*/);
