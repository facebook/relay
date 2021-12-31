/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f52b383e7223a3f0e7de436ad6574111>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$ref = RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType;
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +doesViewerLike: ?boolean,
  +$fragmentType: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType,
|};
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment = RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data;
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data,
  +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data,
>*/);
