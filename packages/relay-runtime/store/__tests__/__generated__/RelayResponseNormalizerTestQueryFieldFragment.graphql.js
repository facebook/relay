/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<50dd211a62b06de0d96f19b9f1d5a81b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestQueryFieldFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestQueryFieldFragment$data = {|
  +__query: {|
    +defaultSettings: ?{|
      +notificationSounds: ?boolean,
    |},
  |},
  +firstName: ?string,
  +$fragmentType: RelayResponseNormalizerTestQueryFieldFragment$fragmentType,
|};
export type RelayResponseNormalizerTestQueryFieldFragment$key = {
  +$data?: RelayResponseNormalizerTestQueryFieldFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTestQueryFieldFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestQueryFieldFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Query",
      "kind": "LinkedField",
      "name": "__query",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Settings",
          "kind": "LinkedField",
          "name": "defaultSettings",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "notificationSounds",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b7bbac04f0da22e55c369761359e95ed";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTestQueryFieldFragment$fragmentType,
  RelayResponseNormalizerTestQueryFieldFragment$data,
>*/);
