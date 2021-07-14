/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3e96d8b393fd4e7edd5551155aa9deff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckTestFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCheckTestFragment$fragmentType: RelayModernEnvironmentCheckTestFragment$ref;
export type RelayModernEnvironmentCheckTestFragment = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentCheckTestFragment$ref,
|};
export type RelayModernEnvironmentCheckTestFragment$data = RelayModernEnvironmentCheckTestFragment;
export type RelayModernEnvironmentCheckTestFragment$key = {
  +$data?: RelayModernEnvironmentCheckTestFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCheckTestFragment$ref,
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

module.exports = node;
