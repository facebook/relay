/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b862f063ac8fbf5994441f7ca38dd736>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data = {|
  +__typename: "User",
  +id: string,
  +missing: ?string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
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
  (node/*:: as any*/).hash = "61f7a1b9bf6a73ec71be2d279a3caea1";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data,
>*/);
