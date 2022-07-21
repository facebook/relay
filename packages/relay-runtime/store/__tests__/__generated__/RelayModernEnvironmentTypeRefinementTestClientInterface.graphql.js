/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3f6eac175a3d34599c61428d097702ac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestClientInterface$data = {|
  +description: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestClientInterface$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestClientInterface$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestClientInterface",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "ClientInterface",
  "abstractKey": "__isClientInterface"
};

if (__DEV__) {
  (node/*: any*/).hash = "287f546a52c69fb148055d6382052c98";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  RelayModernEnvironmentTypeRefinementTestClientInterface$data,
>*/);
