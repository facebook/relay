/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8a0dccf87969d1c3bfbd922a7d6f73a7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType: FragmentType;
export type useFragmentMissingDataRecoveryAttemptTestUserFragment$data = {
  readonly birthdate: ?{
    readonly day: ?number,
  },
  readonly name: ?string,
  readonly $fragmentType: useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType,
};
export type useFragmentMissingDataRecoveryAttemptTestUserFragment$key = {
  readonly $data?: useFragmentMissingDataRecoveryAttemptTestUserFragment$data,
  readonly $fragmentSpreads: useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentMissingDataRecoveryAttemptTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Date",
      "kind": "LinkedField",
      "name": "birthdate",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "day",
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
  (node/*:: as any*/).hash = "6c4ca10756efed97636694ac3eaeda87";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType,
  useFragmentMissingDataRecoveryAttemptTestUserFragment$data,
>*/);
