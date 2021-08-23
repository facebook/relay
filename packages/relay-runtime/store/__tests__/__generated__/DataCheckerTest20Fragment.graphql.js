/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9c9dea5376e7389a9886d1a14adc2ab1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest20Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest20Fragment$fragmentType: DataCheckerTest20Fragment$ref;
export type DataCheckerTest20Fragment = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$refType: DataCheckerTest20Fragment$ref,
|};
export type DataCheckerTest20Fragment$data = DataCheckerTest20Fragment;
export type DataCheckerTest20Fragment$key = {
  +$data?: DataCheckerTest20Fragment$data,
  +$fragmentRefs: DataCheckerTest20Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest20Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "message",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};

if (__DEV__) {
  (node/*: any*/).hash = "78c4c8dd5e4392b7f2b47f485523aabe";
}

module.exports = node;
