/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<408361f89aab857a0c3d6d8e9c83248c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "ClientTypeImplementingServerInterface",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "72e57d2989f15171451b802ea2b67503";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType,
  RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$data,
>*/);
