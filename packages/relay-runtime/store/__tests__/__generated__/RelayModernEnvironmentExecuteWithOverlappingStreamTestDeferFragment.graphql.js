/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<175d52f4040aed0c37cbed70d4d9dbeb>>
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
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref = RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data = {|
  +viewedBy: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment = RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data;
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
  (node/*: any*/).hash = "8a916d37ab47ea699ca21a1212af0c7f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
>*/);
