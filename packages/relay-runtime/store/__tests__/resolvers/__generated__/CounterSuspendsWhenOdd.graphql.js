/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b60b5d56e975f89f8b248c73a4bd7069>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type CounterSuspendsWhenOdd$fragmentType: FragmentType;
export type CounterSuspendsWhenOdd$data = {
  readonly me: ?{
    readonly __id: string,
  },
  readonly $fragmentType: CounterSuspendsWhenOdd$fragmentType,
};
export type CounterSuspendsWhenOdd$key = {
  readonly $data?: CounterSuspendsWhenOdd$data,
  readonly $fragmentSpreads: CounterSuspendsWhenOdd$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CounterSuspendsWhenOdd",
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
  (node/*:: as any*/).hash = "65f0df52ffa3d489390597f9fae96d4d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  CounterSuspendsWhenOdd$fragmentType,
  CounterSuspendsWhenOdd$data,
>*/);
