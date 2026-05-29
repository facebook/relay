/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a935da55fa0a543098bd55d0cbfa297>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data = {
  readonly id: string,
  readonly missing: ?string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestAbstractActorFragment",
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
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e27e3eaa539aba02f3f6fb9a69fd8075";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data,
>*/);
