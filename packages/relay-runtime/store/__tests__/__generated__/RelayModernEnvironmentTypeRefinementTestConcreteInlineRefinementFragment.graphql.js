/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c4fd5fe02f22e44fc99986d346160dc8>>
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
  +id?: string,
  +missing?: ?string,
  +name?: ?string,
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
  (node/*: any*/).hash = "61f7a1b9bf6a73ec71be2d279a3caea1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$data,
>*/);
