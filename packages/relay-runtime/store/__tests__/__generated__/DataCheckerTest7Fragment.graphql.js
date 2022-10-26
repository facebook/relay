/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<892384e89c6fc96752161f80fffb8909>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest7Fragment$fragmentType: FragmentType;
export type DataCheckerTest7Fragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: DataCheckerTest7Fragment$fragmentType,
|};
export type DataCheckerTest7Fragment$key = {
  +$data?: DataCheckerTest7Fragment$data,
  +$fragmentSpreads: DataCheckerTest7Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest7Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
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
  (node/*: any*/).hash = "db975007a0e7059a723db075e9d3cf7e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest7Fragment$fragmentType,
  DataCheckerTest7Fragment$data,
>*/);
