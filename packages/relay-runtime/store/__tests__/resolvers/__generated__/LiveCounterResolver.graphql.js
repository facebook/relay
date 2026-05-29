/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<527c5b211b0a1767daf9f1db94a70f89>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type LiveCounterResolver$fragmentType: FragmentType;
export type LiveCounterResolver$data = {
  readonly me: ?{
    readonly __id: string,
  },
  readonly $fragmentType: LiveCounterResolver$fragmentType,
};
export type LiveCounterResolver$key = {
  readonly $data?: LiveCounterResolver$data,
  readonly $fragmentSpreads: LiveCounterResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveCounterResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "6e340f4ab7751ff9ad23d68c862e0d01";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  LiveCounterResolver$fragmentType,
  LiveCounterResolver$data,
>*/);
