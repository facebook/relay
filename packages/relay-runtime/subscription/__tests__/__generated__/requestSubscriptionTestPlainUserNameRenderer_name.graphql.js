/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0f9f033a55416d9ab4e5afeb6a9b14c0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type requestSubscriptionTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type requestSubscriptionTestPlainUserNameRenderer_name$data = {
  readonly data: ?{
    readonly text: ?string,
  },
  readonly plaintext: ?string,
  readonly $fragmentType: requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
};
export type requestSubscriptionTestPlainUserNameRenderer_name$key = {
  readonly $data?: requestSubscriptionTestPlainUserNameRenderer_name$data,
  readonly $fragmentSpreads: requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "requestSubscriptionTestPlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "d0c83ee826e9d605ba6911852acb5085";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
  requestSubscriptionTestPlainUserNameRenderer_name$data,
>*/);
