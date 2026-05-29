/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fbf0fd6a26460d7ac905b984c2d25b4d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest2Fragment$fragmentType: FragmentType;
export type DataCheckerTest2Fragment$data = {
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: DataCheckerTest2Fragment$fragmentType,
};
export type DataCheckerTest2Fragment$key = {
  readonly $data?: DataCheckerTest2Fragment$data,
  readonly $fragmentSpreads: DataCheckerTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest2Fragment",
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
  (node/*:: as any*/).hash = "9a91f81e017f3267c21ec7f465854acf";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest2Fragment$fragmentType,
  DataCheckerTest2Fragment$data,
>*/);
