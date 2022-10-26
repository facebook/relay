/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c7155e7aedccbcb322248e16b2bc60bb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data = {|
  +id: string,
  +missing: ?string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestConcreteUserFragment",
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
};

if (__DEV__) {
  (node/*: any*/).hash = "3384ae039348799f581d1701a046fd8a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data,
>*/);
