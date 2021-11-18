/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<443913ae2edef4852610d9c9ad188065>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTestFragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTestFragment$ref = RelayMockPayloadGeneratorTestFragment$fragmentType;
export type RelayMockPayloadGeneratorTestFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
    +width: ?number,
    +height: ?number,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTestFragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTestFragment = RelayMockPayloadGeneratorTestFragment$data;
export type RelayMockPayloadGeneratorTestFragment$key = {
  +$data?: RelayMockPayloadGeneratorTestFragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTestFragment",
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
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "width",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "height",
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
  (node/*: any*/).hash = "6bcf93e81ee8984911cf2a69520d4d00";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTestFragment$fragmentType,
  RelayMockPayloadGeneratorTestFragment$data,
>*/);
