/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7d8ae7781815f7a0c0d9e402ad5e2b9d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckTestFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCheckTestFragment$ref = RelayModernEnvironmentCheckTestFragment$fragmentType;
export type RelayModernEnvironmentCheckTestFragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentCheckTestFragment$fragmentType,
|};
export type RelayModernEnvironmentCheckTestFragment = RelayModernEnvironmentCheckTestFragment$data;
export type RelayModernEnvironmentCheckTestFragment$key = {
  +$data?: RelayModernEnvironmentCheckTestFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentCheckTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCheckTestFragment",
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
  (node/*: any*/).hash = "1b4a25ad102257cf57bbce2a658d418e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCheckTestFragment$fragmentType,
  RelayModernEnvironmentCheckTestFragment$data,
>*/);
