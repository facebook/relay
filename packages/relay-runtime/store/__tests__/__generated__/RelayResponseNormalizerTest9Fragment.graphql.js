/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3b9f5f14d75ae99c7d6cb7a293393413>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest9Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest9Fragment$data = {
  readonly actors: ?ReadonlyArray<?{
    readonly name: ?string,
  }>,
  readonly id: string,
  readonly $fragmentType: RelayResponseNormalizerTest9Fragment$fragmentType,
};
export type RelayResponseNormalizerTest9Fragment$key = {
  readonly $data?: RelayResponseNormalizerTest9Fragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTest9Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest9Fragment",
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
  (node/*:: as any*/).hash = "b0cf187c649d10ea7929de096205c7cf";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest9Fragment$fragmentType,
  RelayResponseNormalizerTest9Fragment$data,
>*/);
