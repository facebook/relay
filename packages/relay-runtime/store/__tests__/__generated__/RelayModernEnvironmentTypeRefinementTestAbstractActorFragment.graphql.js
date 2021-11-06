/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<01c37786b8c77a9ed07b7779c473b6f6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment = {|
  +id: string,
  +name: ?string,
  +missing: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data = RelayModernEnvironmentTypeRefinementTestAbstractActorFragment;
export type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref,
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

module.exports = node;
