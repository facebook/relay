/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d2bb948d2998116eb3f7cd367c37deb2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$key = {
  +$data?: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType,
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
  (node/*:: as any*/).hash = "0f52103d115cff3b1f20f5fc3df68230";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$fragmentType,
  RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto$data,
>*/);
