/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ac870196c6caa1792865d57e69f410e4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type LivePingPongResolver$fragmentType: FragmentType;
export type LivePingPongResolver$data = {|
  +me: ?{|
    +__id: string,
  |},
  +$fragmentType: LivePingPongResolver$fragmentType,
|};
export type LivePingPongResolver$key = {
  +$data?: LivePingPongResolver$data,
  +$fragmentSpreads: LivePingPongResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LivePingPongResolver",
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
  (node/*: any*/).hash = "652b3dbfefdb44cf8e76d65fb593f286";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LivePingPongResolver$fragmentType,
  LivePingPongResolver$data,
>*/);
