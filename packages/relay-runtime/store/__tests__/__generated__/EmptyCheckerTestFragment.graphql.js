/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1530c3679cd8b28a4fe62500ca0280fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type EmptyCheckerTestFragment$fragmentType: FragmentType;
export type EmptyCheckerTestFragment$data = {|
  +me: ?{|
    +id: string,
  |},
  +$fragmentType: EmptyCheckerTestFragment$fragmentType,
|};
export type EmptyCheckerTestFragment$key = {
  +$data?: EmptyCheckerTestFragment$data,
  +$fragmentSpreads: EmptyCheckerTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EmptyCheckerTestFragment",
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
  (node/*: any*/).hash = "3ed6b5c6431c117994903dd56b0b39b5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  EmptyCheckerTestFragment$fragmentType,
  EmptyCheckerTestFragment$data,
>*/);
