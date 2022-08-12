/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<224c5b1248e216700e306c59f2fc5b90>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestClient2Interface$fragmentType: FragmentType;
export type DataCheckerTestClient2Interface$data = {|
  +description: ?string,
  +$fragmentType: DataCheckerTestClient2Interface$fragmentType,
|};
export type DataCheckerTestClient2Interface$key = {
  +$data?: DataCheckerTestClient2Interface$data,
  +$fragmentSpreads: DataCheckerTestClient2Interface$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTestClient2Interface",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "ClientInterface",
  "abstractKey": "__isClientInterface"
};

if (__DEV__) {
  (node/*: any*/).hash = "9650b9ade2708e969935ffb73b26a4c8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTestClient2Interface$fragmentType,
  DataCheckerTestClient2Interface$data,
>*/);
