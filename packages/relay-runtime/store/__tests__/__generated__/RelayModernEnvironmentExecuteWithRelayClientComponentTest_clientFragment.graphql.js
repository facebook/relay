/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c895476d2f77c656e1fa5ca467399035>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$ref;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data = RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$ref,
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

module.exports = node;
