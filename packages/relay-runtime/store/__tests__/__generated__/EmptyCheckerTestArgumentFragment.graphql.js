/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2fbd896ed420668b978bbe465869e443>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type EmptyCheckerTestArgumentFragment$fragmentType: FragmentType;
export type EmptyCheckerTestArgumentFragment$data = {|
  +me?: ?{|
    +id: string,
  |},
  +$fragmentType: EmptyCheckerTestArgumentFragment$fragmentType,
|};
export type EmptyCheckerTestArgumentFragment$key = {
  +$data?: EmptyCheckerTestArgumentFragment$data,
  +$fragmentSpreads: EmptyCheckerTestArgumentFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "includeMeField"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "EmptyCheckerTestArgumentFragment",
  "selections": [
    {
      "condition": "includeMeField",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5c27f1d99bcc8a72778e01bb4e26c894";
}

module.exports = ((node/*: any*/)/*: Fragment<
  EmptyCheckerTestArgumentFragment$fragmentType,
  EmptyCheckerTestArgumentFragment$data,
>*/);
