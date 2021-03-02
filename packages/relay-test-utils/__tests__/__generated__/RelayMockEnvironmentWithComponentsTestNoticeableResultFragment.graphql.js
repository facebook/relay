/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e6a4fb5c7e9c40f88c82e0c2c4f63ee2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$ref: FragmentReference;
declare export opaque type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$ref;
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +doesViewerLike: ?boolean,
  +$refType: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$ref,
|};
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data = RelayMockEnvironmentWithComponentsTestNoticeableResultFragment;
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data,
  +$fragmentRefs: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockEnvironmentWithComponentsTestNoticeableResultFragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "doesViewerLike",
      "storageKey": null
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7ca93b0d31402b484bcbb0af777a088e";
}

module.exports = node;
