/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2d436bf00403b9a2c7d5e590dccf8671>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data = {
  readonly id?: string,
  readonly missing?: ?string,
  readonly name?: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment",
  "selections": [
    {
      "kind": "InlineFragment",
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
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": "missing",
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        }
      ],
      "type": "Actor",
      "abstractKey": "__isActor"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "9b04457c774f58f84031cf459159901f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data,
>*/);
