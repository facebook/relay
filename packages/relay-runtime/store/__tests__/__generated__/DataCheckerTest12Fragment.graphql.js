/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b108c1442fe51ec42004f052ba27a280>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest12Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest12Fragment$fragmentType: DataCheckerTest12Fragment$ref;
export type DataCheckerTest12Fragment = {|
  +screennames: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: DataCheckerTest12Fragment$ref,
|};
export type DataCheckerTest12Fragment$data = DataCheckerTest12Fragment;
export type DataCheckerTest12Fragment$key = {
  +$data?: DataCheckerTest12Fragment$data,
  +$fragmentRefs: DataCheckerTest12Fragment$ref,
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
  (node/*: any*/).hash = "8dd733aeb8f041370136353d0509201c";
}

module.exports = node;
