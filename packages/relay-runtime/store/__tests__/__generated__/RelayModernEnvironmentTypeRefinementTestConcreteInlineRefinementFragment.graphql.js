/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1cc109a3b608cb289dd2060261002abf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref;
export type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment = {|
  +id?: string,
  +name?: ?string,
  +missing?: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data = RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment;
export type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment",
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
      "type": "User",
      "abstractKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*: any*/).hash = "61f7a1b9bf6a73ec71be2d279a3caea1";
}

module.exports = node;
