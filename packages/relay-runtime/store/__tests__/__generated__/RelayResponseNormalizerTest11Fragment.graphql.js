/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0bcd3a0c25992fa93c82672f7fd10740>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest11Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest11Fragment$data = {
  readonly actors: ?ReadonlyArray<?{
    readonly name: ?string,
  }>,
  readonly id: string,
  readonly $fragmentType: RelayResponseNormalizerTest11Fragment$fragmentType,
};
export type RelayResponseNormalizerTest11Fragment$key = {
  readonly $data?: RelayResponseNormalizerTest11Fragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTest11Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest11Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "7e79f0491ae7de39d3dbabc52e6f0de1";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest11Fragment$fragmentType,
  RelayResponseNormalizerTest11Fragment$data,
>*/);
