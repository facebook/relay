/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4529a89e437a2ce882ec14528b72c27>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref = RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment = RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment",
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
    }
  ],
  "type": "Story",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ea85bfcba4ce6cf4e091669c406f440d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType,
  RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data,
>*/);
