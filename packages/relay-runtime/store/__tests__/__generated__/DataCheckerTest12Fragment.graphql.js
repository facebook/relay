/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d88df8053efecccc5eba656a4e356bf0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest12Fragment$fragmentType: FragmentType;
export type DataCheckerTest12Fragment$data = {|
  +screennames: ?ReadonlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: DataCheckerTest12Fragment$fragmentType,
|};
export type DataCheckerTest12Fragment$key = {
  +$data?: DataCheckerTest12Fragment$data,
  +$fragmentSpreads: DataCheckerTest12Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest12Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Screenname",
      "kind": "LinkedField",
      "name": "screennames",
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
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "8dd733aeb8f041370136353d0509201c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest12Fragment$fragmentType,
  DataCheckerTest12Fragment$data,
>*/);
