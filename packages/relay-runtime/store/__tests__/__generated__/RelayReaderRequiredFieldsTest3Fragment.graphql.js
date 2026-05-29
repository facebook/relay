/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e91f2f0c5031c72ccc1b512afb840ca8>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest3Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest3Fragment$data = ?{
  readonly me: {
    readonly lastName: string,
  },
  readonly $fragmentType: RelayReaderRequiredFieldsTest3Fragment$fragmentType,
};
export type RelayReaderRequiredFieldsTest3Fragment$key = {
  readonly $data?: RelayReaderRequiredFieldsTest3Fragment$data,
  readonly $fragmentSpreads: RelayReaderRequiredFieldsTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest3Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lastName",
              "storageKey": null
            },
            "action": "LOG"
          }
        ],
        "storageKey": null
      },
      "action": "LOG"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "d4ab0530862820fe6aff8595b3700bd9";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderRequiredFieldsTest3Fragment$fragmentType,
  RelayReaderRequiredFieldsTest3Fragment$data,
>*/);
