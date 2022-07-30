/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<897e14f45130e0c298f682a85c6d9d89>>
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
export type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$data = {|
  +doesViewerLike: ?boolean,
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType,
|};
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
