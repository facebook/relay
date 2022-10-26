/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dc9e84080626eceab682c29c1e8dc6b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data = {|
  +id?: string,
  +missing?: ?string,
  +name?: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
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
  (node/*: any*/).hash = "9b04457c774f58f84031cf459159901f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data,
>*/);
