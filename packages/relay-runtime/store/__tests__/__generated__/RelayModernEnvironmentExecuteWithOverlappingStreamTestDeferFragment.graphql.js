/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<63e54f7bba27ab0c8b058e63e208171c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data = {
  readonly viewedBy: ?ReadonlyArray<?{
    readonly name: ?string,
  }>,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
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
  (node/*:: as any*/).hash = "8a916d37ab47ea699ca21a1212af0c7f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$data,
>*/);
