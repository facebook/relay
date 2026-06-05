/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bc6f0714e97d19b925610a4c9b62bed4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type EmptyCheckerTestDeferFragment$fragmentType: FragmentType;
export type EmptyCheckerTestDeferFragment$data = {|
  +me: ?{|
    +id: string,
  |},
  +$fragmentType: EmptyCheckerTestDeferFragment$fragmentType,
|};
export type EmptyCheckerTestDeferFragment$key = {
  +$data?: EmptyCheckerTestDeferFragment$data,
  +$fragmentSpreads: EmptyCheckerTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EmptyCheckerTestDeferFragment",
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
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "155077642b8d2601c69bbf9b3e4bc773";
}

module.exports = ((node/*: any*/)/*: Fragment<
  EmptyCheckerTestDeferFragment$fragmentType,
  EmptyCheckerTestDeferFragment$data,
>*/);
