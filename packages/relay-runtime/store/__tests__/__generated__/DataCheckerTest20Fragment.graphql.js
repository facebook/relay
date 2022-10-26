/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab256d6795ffbf47e37ab04ead9a3d95>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest20Fragment$fragmentType: FragmentType;
export type DataCheckerTest20Fragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: DataCheckerTest20Fragment$fragmentType,
|};
export type DataCheckerTest20Fragment$key = {
  +$data?: DataCheckerTest20Fragment$data,
  +$fragmentSpreads: DataCheckerTest20Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest20Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "message",
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
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};

if (__DEV__) {
  (node/*: any*/).hash = "78c4c8dd5e4392b7f2b47f485523aabe";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest20Fragment$fragmentType,
  DataCheckerTest20Fragment$data,
>*/);
