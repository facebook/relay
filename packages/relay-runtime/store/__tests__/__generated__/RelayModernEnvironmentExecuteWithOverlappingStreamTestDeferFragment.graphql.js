/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e5641d6b7b604cb1a40a138abaa66dd6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment = {|
  +viewedBy: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data = RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref,
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

module.exports = node;
