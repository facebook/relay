/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<015465b43b9a8d7bff258f5d4555971d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data = {
  readonly doesViewerLike: ?boolean,
  readonly id: string,
  readonly message: ?{
    readonly text: ?string,
  },
  readonly $fragmentType: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
};
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$key = {
  readonly $data?: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data,
  readonly $fragmentSpreads: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment",
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
  (node/*:: as any*/).hash = "afc4f54ab4d51941dca5c3cede03b6ba";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data,
>*/);
