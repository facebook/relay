/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9236da88ae2f68a23d9f64dd2af64310>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref;
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment = {|
  +id?: string,
  +name?: ?string,
  +missing?: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data = RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment;
export type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref,
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

module.exports = node;
