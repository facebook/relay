/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31448f31823504f8ed6913527df23fc3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$ref = RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment = RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment",
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
  (node/*: any*/).hash = "18679cc241c9b27229ab29e32aad5597";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType,
  RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data,
>*/);
