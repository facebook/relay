/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1f4292c967e8552caf47979720894bb2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data = {|
  +viewedBy: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment",
  "selections": [
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": "viewedBy",
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "__viewedBy_actors_handler",
          "plural": true,
          "selections": [
            {
              "alias": "name",
              "args": null,
              "kind": "ScalarField",
              "name": "__name_name_handler",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0482e4332204d0cb1f454523f49591b0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
>*/);
