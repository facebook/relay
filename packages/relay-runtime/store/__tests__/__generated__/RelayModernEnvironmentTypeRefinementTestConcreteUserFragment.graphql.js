/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<921b41fc23218a6b890bfcb2ba3f23d2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data = {
  readonly id: string,
  readonly missing: ?string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "3384ae039348799f581d1701a046fd8a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data,
>*/);
