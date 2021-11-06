/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a2ca3561152c475a1a845ebfceb0f449>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest17Fragment$ref = any;
type RelayMockPayloadGeneratorTest18Fragment$ref = any;
type RelayMockPayloadGeneratorTest19Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest20Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest20Fragment$fragmentType: RelayMockPayloadGeneratorTest20Fragment$ref;
export type RelayMockPayloadGeneratorTest20Fragment = {|
  +body: ?{|
    +text: ?string,
  |},
  +actor: ?{|
    +name: ?string,
    +id: string,
  |},
  +myActor: ?{|
    +$fragmentRefs: RelayMockPayloadGeneratorTest17Fragment$ref,
  |},
  +$fragmentRefs: RelayMockPayloadGeneratorTest18Fragment$ref & RelayMockPayloadGeneratorTest19Fragment$ref,
  +$refType: RelayMockPayloadGeneratorTest20Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest20Fragment$data = RelayMockPayloadGeneratorTest20Fragment;
export type RelayMockPayloadGeneratorTest20Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest20Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest20Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest20Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": "myActor",
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayMockPayloadGeneratorTest17Fragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest18Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest19Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d436f500bb695c067652f4f926493f86";
}

module.exports = node;
