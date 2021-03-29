/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<458d9b8cd9a9735fc4d2ff63d460257d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$fragmentType: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data = RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref,
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

module.exports = node;
