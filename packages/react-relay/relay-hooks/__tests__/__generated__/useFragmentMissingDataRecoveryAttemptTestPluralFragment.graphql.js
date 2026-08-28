/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2aae866be442f0949e6faeead2514dab>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType: FragmentType;
export type useFragmentMissingDataRecoveryAttemptTestPluralFragment$data = ReadonlyArray<{
  readonly birthdate: ?{
    readonly day: ?number,
  },
  readonly name: ?string,
  readonly $fragmentType: useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType,
}>;
export type useFragmentMissingDataRecoveryAttemptTestPluralFragment$key = ReadonlyArray<{
  readonly $data?: useFragmentMissingDataRecoveryAttemptTestPluralFragment$data,
  readonly $fragmentSpreads: useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useFragmentMissingDataRecoveryAttemptTestPluralFragment",
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
  (node/*:: as any*/).hash = "9e3f5fffb9cf171e9f52ef78a60a6f7d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType,
  useFragmentMissingDataRecoveryAttemptTestPluralFragment$data,
>*/);
