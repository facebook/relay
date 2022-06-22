/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a4bda021cbaa88551a68f90cbdbf709>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderFragmentQueryTestFragment$fragmentType: FragmentType;
export type RelayReaderFragmentQueryTestFragment$data = {|
  +__query: {|
    +me: ?{|
      +firstName: ?string,
    |},
  |},
  +$fragmentType: RelayReaderFragmentQueryTestFragment$fragmentType,
|};
export type RelayReaderFragmentQueryTestFragment$key = {
  +$data?: RelayReaderFragmentQueryTestFragment$data,
  +$fragmentSpreads: RelayReaderFragmentQueryTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderFragmentQueryTestFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Query",
      "kind": "LinkedField",
      "name": "__query",
      "plural": false,
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
              "name": "firstName",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1929e561e4ba155c697e55525fdd4d5a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderFragmentQueryTestFragment$fragmentType,
  RelayReaderFragmentQueryTestFragment$data,
>*/);
