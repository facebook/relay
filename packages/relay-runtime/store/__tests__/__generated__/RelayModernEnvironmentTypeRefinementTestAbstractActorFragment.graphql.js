/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d02d2772fd6e92eca758d27f1b9d67d2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref = RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data = {|
  +id: string,
  +name: ?string,
  +missing: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment = RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
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
  (node/*: any*/).hash = "e27e3eaa539aba02f3f6fb9a69fd8075";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data,
>*/);
