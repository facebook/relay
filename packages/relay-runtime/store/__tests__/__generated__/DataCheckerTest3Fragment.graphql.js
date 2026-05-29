/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6451c8f8a743e9975726359b755d3465>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest3Fragment$fragmentType: FragmentType;
export type DataCheckerTest3Fragment$data = {
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: DataCheckerTest3Fragment$fragmentType,
};
export type DataCheckerTest3Fragment$key = {
  readonly $data?: DataCheckerTest3Fragment$data,
  readonly $fragmentSpreads: DataCheckerTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest3Fragment",
  "selections": [
    {
      "alias": "profilePicture",
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "__profilePicture_test",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
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
  (node/*:: as any*/).hash = "e5a41edb95a798fa731c3074cc026ba9";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest3Fragment$fragmentType,
  DataCheckerTest3Fragment$data,
>*/);
