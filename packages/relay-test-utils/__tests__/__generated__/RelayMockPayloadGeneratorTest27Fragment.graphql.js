/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1f9625209cd5a6ada3c2a87b8ffaadf3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest24Fragment$ref = any;
type RelayMockPayloadGeneratorTest25Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest27Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest27Fragment$fragmentType: RelayMockPayloadGeneratorTest27Fragment$ref;
export type RelayMockPayloadGeneratorTest27Fragment = {|
  +body: ?{|
    +text: ?string,
  |},
  +actor: ?{|
    +name: ?string,
    +id: string,
  |},
  +myActor: ?{|
    +$fragmentRefs: RelayMockPayloadGeneratorTest24Fragment$ref,
  |},
  +$fragmentRefs: RelayMockPayloadGeneratorTest25Fragment$ref,
  +$refType: RelayMockPayloadGeneratorTest27Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest27Fragment$data = RelayMockPayloadGeneratorTest27Fragment;
export type RelayMockPayloadGeneratorTest27Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest27Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest27Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest27Fragment",
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
          "name": "RelayMockPayloadGeneratorTest24Fragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest25Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "07719ddfc2591587bf8141cba4f35d9f";
}

module.exports = node;
