/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a7c3a1dc031a73b160d41891f333c369>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type CounterSuspendsWhenOdd$fragmentType: FragmentType;
export type CounterSuspendsWhenOdd$data = {|
  +me: ?{|
    +__id: string,
  |},
  +$fragmentType: CounterSuspendsWhenOdd$fragmentType,
|};
export type CounterSuspendsWhenOdd$key = {
  +$data?: CounterSuspendsWhenOdd$data,
  +$fragmentSpreads: CounterSuspendsWhenOdd$fragmentType,
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
  (node/*: any*/).hash = "65f0df52ffa3d489390597f9fae96d4d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  CounterSuspendsWhenOdd$fragmentType,
  CounterSuspendsWhenOdd$data,
>*/);
