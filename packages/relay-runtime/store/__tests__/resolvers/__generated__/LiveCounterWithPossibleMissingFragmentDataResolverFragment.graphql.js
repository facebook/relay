/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1db67f48498bb45a1d24b35d730a7da8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type LiveCounterWithPossibleMissingFragmentDataResolverFragment$fragmentType: FragmentType;
export type LiveCounterWithPossibleMissingFragmentDataResolverFragment$data = {|
  +me: ?{|
    +id: string,
  |},
  +$fragmentType: LiveCounterWithPossibleMissingFragmentDataResolverFragment$fragmentType,
|};
export type LiveCounterWithPossibleMissingFragmentDataResolverFragment$key = {
  +$data?: LiveCounterWithPossibleMissingFragmentDataResolverFragment$data,
  +$fragmentSpreads: LiveCounterWithPossibleMissingFragmentDataResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveCounterWithPossibleMissingFragmentDataResolverFragment",
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
          "kind": "RequiredField",
          "field": {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          "action": "THROW"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4eea9963dd2f5e34f4d724ba13f41643";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveCounterWithPossibleMissingFragmentDataResolverFragment$fragmentType,
  LiveCounterWithPossibleMissingFragmentDataResolverFragment$data,
>*/);
