/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9bd42132257e786b2f629c1a3843b709>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type EmptyCheckerTestConditionalFragment$fragmentType: FragmentType;
export type EmptyCheckerTestConditionalFragment$data = {|
  +me?: ?{|
    +id: string,
  |},
  +$fragmentType: EmptyCheckerTestConditionalFragment$fragmentType,
|};
export type EmptyCheckerTestConditionalFragment$key = {
  +$data?: EmptyCheckerTestConditionalFragment$data,
  +$fragmentSpreads: EmptyCheckerTestConditionalFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "EmptyCheckerTestConditionalFragment",
  "selections": [
    {
      "condition": "cond",
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
  (node/*: any*/).hash = "3c2009bac3faaa7fa56e72c0e0bf465a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  EmptyCheckerTestConditionalFragment$fragmentType,
  EmptyCheckerTestConditionalFragment$data,
>*/);
