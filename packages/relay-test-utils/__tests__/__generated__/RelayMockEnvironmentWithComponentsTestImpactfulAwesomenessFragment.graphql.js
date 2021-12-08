/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4cddece53278854804490047c8f2998>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$ref = RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +doesViewerLike: ?boolean,
  +$fragmentType: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
|};
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment = RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data,
  +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
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
  (node/*: any*/).hash = "afc4f54ab4d51941dca5c3cede03b6ba";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data,
>*/);
