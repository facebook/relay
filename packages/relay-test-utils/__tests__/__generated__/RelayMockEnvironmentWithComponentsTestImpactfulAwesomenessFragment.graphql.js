/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<438fd4c59252888acda646d443feaafa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$ref: FragmentReference;
declare export opaque type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$ref;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +doesViewerLike: ?boolean,
  +$refType: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$ref,
|};
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data = RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment;
export type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$data,
  +$fragmentRefs: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$ref,
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

module.exports = node;
